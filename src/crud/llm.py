from loguru import logger
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.models.llm import LLMInstance, LLMSubinstance, ListedLLM
from src.models.organization import Organization
from src.schemas.llm import LLMSubinstanceCreate, ModelQuota


class LLMInstanceCRUD:
    """CRUD operations for LLM instances"""

    @staticmethod
    async def get_llm_from_listed_llm_id(
        db: AsyncSession, listed_llm_id: UUID
    ) -> tuple[ListedLLM | None, LLMInstance | None]:
        """
        Get listed LLM and optionally its active instance
        """
        # TODO: modify this function to return a list of LLMinstances rather than one. And keep into account max_tenants
        stmt = (
            select(ListedLLM, LLMInstance)
            .outerjoin(
                LLMInstance,
                and_(
                    LLMInstance.listed_llm_id == ListedLLM.id,
                    LLMInstance.status == "active",
                    LLMInstance.deleted_at.is_(None),
                ),
            )
            .where(
                and_(
                    ListedLLM.id == listed_llm_id,
                    ListedLLM.status == "live",
                    ListedLLM.deleted_at.is_(None),
                )
            )
            .options(selectinload(LLMInstance.llm_subinstances))
        )
        result = await db.execute(stmt)
        row = result.one_or_none()

        if not row:
            return None, None

        return row[0], row[1]  # (listed_llm, llm_instance or None)

    @staticmethod
    async def can_provision_instance(
        remaining_quota: dict, model_params: str, is_dedicated: bool
    ) -> bool:
        """
        Verify if org can provision a new instance based on remaining quota

        Args:
            remaining_quota: Dict with dedicated_llms and instances quotas
            model_params: Model size in params
            is_dedicated: Whether this will be a dedicated instance

        Returns:
            bool: True if provisioning is allowed, False otherwise
        """
        # Check 1: If it's a dedicated LLM, check dedicated quota
        if is_dedicated:
            if remaining_quota["dedicated_llms"]["remaining"] <= 0:
                logger.warning("Dedicated LLM quota exceeded")
                return False

        # Check 2: Check total instance quota (if not unlimited)
        total_instances_remaining = remaining_quota["instances"]["remaining"]
        if total_instances_remaining is not None and total_instances_remaining <= 0:
            logger.warning("Total instance quota exceeded")
            return False

        # Check 3: Check param size specific quota
        param_quotas = remaining_quota["instances"]["by_param_size"]

        # Find matching param size quota
        matching_quota = None
        for quota in param_quotas:
            if quota.model_params == model_params:
                matching_quota = quota
                break

        if matching_quota is None:
            # No quota defined for this param size - not allowed
            logger.warning(f"No quota defined for model params: {model_params}")
            return False

        if matching_quota.remaining <= 0:
            logger.warning(f"Quota exceeded for {model_params} models")
            return False

        # All checks passed
        return True

    async def check_maximum_tenants_and_dedicated_constraint(llm_instance: LLMInstance):
        subinstances_count = len(llm_instance.llm_subinstances)
        has_dedicated = any(sub.is_dedicated for sub in llm_instance.llm_subinstances)
        return has_dedicated or subinstances_count >= llm_instance.maximum_tenants


class LLMSubinstanceCRUD:
    """CRUD operations for LLM Subinstances (user facing)"""

    @staticmethod
    async def create(
        db: AsyncSession,
        org_id: UUID,
        llm_instance_id: UUID,
        data: LLMSubinstanceCreate,
        user_id: UUID | None = None,
    ) -> LLMSubinstance:
        """Create a new LLM subinstance for an organization"""
        subinstance = LLMSubinstance(
            org_id=org_id,
            llm_instance_id=llm_instance_id,
            user_id=user_id,
            name=data.name,
            base_config={},  # TODO: check base config and credit_price_per_hour
            credit_price_per_hour=5,
            is_dedicated=data.is_dedicated,
        )
        db.add(subinstance)
        await db.commit()
        await db.refresh(subinstance)
        return subinstance

    @staticmethod
    async def get_by_id(
        db: AsyncSession,
        subinstance_id: UUID,
        org_id: UUID,
    ) -> Optional[LLMSubinstance]:
        """Get a subinstance by ID for a specific organization"""
        stmt = (
            select(LLMSubinstance)
            .options(selectinload(LLMSubinstance.llm_instance))
            .where(
                and_(
                    LLMSubinstance.id == subinstance_id,
                    LLMSubinstance.org_id == org_id,
                    LLMSubinstance.deleted_at.is_(None),
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_org_remaining_quota(
        db: AsyncSession,
        org_id: UUID,
        for_update: bool = False,  # locking parameter
    ) -> dict:
        """Returns remaining quota for org including dedicated LLMs and instances"""

        # Get the organization with its plan
        org_stmt = (
            select(Organization)
            .options(selectinload(Organization.plan))
            .where(Organization.id == org_id)
        )
        if for_update:
            org_stmt = org_stmt.with_for_update()

        org_result = await db.execute(org_stmt)
        org = org_result.scalar_one_or_none()

        if not org:
            raise ValueError(f"Organization {org_id} not found")

        # Extract LLM limits from plan
        llm_limits = org.plan.features.get("llm_limits", {})
        instance_limits = llm_limits.get("instance_limits", [])
        max_instances = llm_limits.get("max_instances")
        max_dedicated_llms = llm_limits.get("max_dedicated_llms", 0)

        # Get all subinstances (both dedicated and shared)
        stmt = (
            select(LLMSubinstance, LLMInstance, ListedLLM)
            .join(LLMSubinstance.llm_instance)
            .join(LLMInstance.listed_llm)
            .where(
                and_(
                    LLMSubinstance.org_id == org_id, LLMSubinstance.deleted_at.is_(None)
                )
            )
        )
        result = await db.execute(stmt)
        rows = result.all()

        # Count dedicated LLMs and instances by param size
        current_dedicated_count = 0
        current_usage = {}
        total_instances = 0

        for subinstance, instance, listed_llm in rows:
            param_size = listed_llm.base_config.get("parameters")  # e.g., "70B", "270B"

            # Count dedicated LLMs
            if subinstance.is_dedicated:
                current_dedicated_count += 1

            # Count all instances by param size
            current_usage[param_size] = current_usage.get(param_size, 0) + 1
            total_instances += 1

        # Calculate remaining quota for each tier
        quota_list = []
        for limit in instance_limits:
            max_params = limit["max_params"]
            max_count = limit["max_count"]
            current_count = current_usage.get(max_params, 0)
            remaining = max_count - current_count

            quota_list.append(
                ModelQuota(
                    model_params=max_params,
                    max_count=max_count,
                    current_count=current_count,
                    remaining=max(0, remaining),
                )
            )

        return {
            "dedicated_llms": {
                "max_count": max_dedicated_llms,
                "current_count": current_dedicated_count,
                "remaining": max(0, max_dedicated_llms - current_dedicated_count),
            },
            "instances": {
                "max_count": max_instances,  # None = unlimited
                "current_count": total_instances,
                "remaining": None
                if max_instances is None
                else max(0, max_instances - total_instances),
                "by_param_size": quota_list,
            },
        }

    @staticmethod
    async def get_by_org(
        db: AsyncSession,
        org_id: UUID,
        skip: int = 0,
        limit: int = 100,
        include_deleted: bool = False,
    ) -> list[LLMSubinstance]:
        """Get all subinstances for an organization"""
        stmt = (
            select(LLMSubinstance)
            .options(selectinload(LLMSubinstance.llm_instance))
            .where(LLMSubinstance.org_id == org_id)
        )

        if not include_deleted:
            stmt = stmt.where(LLMSubinstance.deleted_at.is_(None))

        stmt = stmt.order_by(LLMSubinstance.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_user(
        db: AsyncSession,
        user_id: UUID,
        org_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[LLMSubinstance]:
        """Get all subinstances created by a specific user in an organization"""
        stmt = (
            select(LLMSubinstance)
            .options(selectinload(LLMSubinstance.llm_instance))
            .where(
                and_(
                    LLMSubinstance.user_id == user_id,
                    LLMSubinstance.org_id == org_id,
                    LLMSubinstance.deleted_at.is_(None),
                )
            )
            .order_by(LLMSubinstance.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    @staticmethod
    async def update(
        db: AsyncSession,
        subinstance_id: UUID,
        org_id: UUID,
        data: LLMSubinstanceCreate,
    ) -> Optional[LLMSubinstance]:
        """Update a subinstance"""
        subinstance = await LLMSubinstanceCRUD.get_by_id(db, subinstance_id, org_id)
        if not subinstance:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(subinstance, field, value)

        await db.commit()
        await db.refresh(subinstance)
        return subinstance

    @staticmethod
    async def soft_delete(
        db: AsyncSession,
        subinstance_id: UUID,
        org_id: UUID,
    ) -> bool:
        """Soft delete a subinstance"""
        subinstance = await LLMSubinstanceCRUD.get_by_id(db, subinstance_id, org_id)
        if not subinstance:
            return False

        subinstance.deleted_at = datetime.utcnow()
        await db.commit()
        return True

    @staticmethod
    async def hard_delete(
        db: AsyncSession,
        subinstance_id: UUID,
        org_id: UUID,
    ) -> bool:
        """Hard delete a subinstance (use with caution)"""
        subinstance = await LLMSubinstanceCRUD.get_by_id(db, subinstance_id, org_id)
        if not subinstance:
            return False

        await db.delete(subinstance)
        await db.commit()
        return True

    @staticmethod
    async def count_by_org(
        db: AsyncSession,
        org_id: UUID,
        include_deleted: bool = False,
    ) -> int:
        """Count subinstances for an organization"""
        stmt = (
            select(func.count())
            .select_from(LLMSubinstance)
            .where(LLMSubinstance.org_id == org_id)
        )

        if not include_deleted:
            stmt = stmt.where(LLMSubinstance.deleted_at.is_(None))

        result = await db.execute(stmt)
        return result.scalar_one()
