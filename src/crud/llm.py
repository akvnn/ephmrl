from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime
from typing import Optional

from src.models.llm import LLMInstance, LLMSubinstance, ListedLLM
from src.schemas.llm import LLMSubinstanceCreate


class LLMInstanceCRUD:
    """CRUD operations for LLM instances"""

    @staticmethod
    async def get_instance_id_from_listed_llm(
        db: AsyncSession, listed_llm_id: UUID
    ) -> UUID | None:
        """
        Get instance ID from listed LLM ID
        Also verifies availability and readiness of the LLM
        """
        stmt = (
            select(LLMInstance.id)
            .join(LLMInstance.listed_llm)
            .where(
                and_(
                    LLMInstance.listed_llm_id == listed_llm_id,
                    ListedLLM.status == "live",
                    LLMInstance.status == "active",
                    ListedLLM.deleted_at.is_(None),
                    LLMInstance.deleted_at.is_(None),
                )
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()


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
