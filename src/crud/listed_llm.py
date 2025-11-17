from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.llm import ListedLLM


class ListedLLMCRUD:
    @staticmethod
    async def get_available(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> list[ListedLLM] | None:
        """Get a subinstance by ID for a specific organization"""
        stmt = (
            select(ListedLLM)
            # .options(selectinload(ListedLLM.llm_instance)) # llm instance availability and max tenant/dedication situation (or need to provision a new one) should be checked when the user creates a model of that listed llm kind
            .where(and_(ListedLLM.status == "live", ListedLLM.deleted_at.is_(None)))
        )
        stmt = stmt.order_by(ListedLLM.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())
