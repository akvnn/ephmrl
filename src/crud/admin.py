from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.gpu import GPU
from src.models.llm import LLMInstance


class AdminCRUD:
    """CRUD operations for Admin"""

    @staticmethod
    async def get_llm_instances(
        db: AsyncSession, skip: int, limit: int, filter_by_active: bool = False
    ) -> list[LLMInstance]:
        stmt = (
            select(LLMInstance)
            .options(selectinload(LLMInstance.gpus).selectinload(GPU.machine))
            .where(LLMInstance.deleted_at.is_(None))
        )
        stmt = stmt.order_by(LLMInstance.created_at.desc()).offset(skip).limit(limit)
        if filter_by_active:
            stmt = stmt.where(LLMInstance.status == "active")
        result = await db.execute(stmt)
        return list(result.scalars().all())
