from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.plugin import Plugin


async def get_plugin_by_slug(db: AsyncSession, slug: str) -> Plugin | None:
    result = await db.execute(select(Plugin).where(Plugin.slug == slug))
    return result.scalar_one_or_none()
