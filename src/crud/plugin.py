from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from uuid import UUID
import httpx
from loguru import logger

from src.models.plugin import Plugin, OrganizationPlugin


class PluginCRUD:
    @staticmethod
    async def get_by_slug(db: AsyncSession, slug: str) -> Plugin | None:
        """Get a plugin by its slug"""
        result = await db.execute(select(Plugin).where(Plugin.slug == slug))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
    ) -> list[Plugin]:
        """Get all available plugins"""
        query = select(Plugin).offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())


class OrganizationPluginCRUD:
    @staticmethod
    async def is_installed(
        db: AsyncSession,
        org_id: UUID,
        plugin_slug: str,
    ) -> bool:
        result = await db.execute(
            select(OrganizationPlugin).where(
                and_(
                    OrganizationPlugin.org_id == org_id,
                    OrganizationPlugin.plugin_slug == plugin_slug,
                )
            )
        )
        return result.scalar_one_or_none() is not None

    @staticmethod
    async def get_installed(
        db: AsyncSession,
        org_id: UUID,
        skip: int = 0,
        limit: int = 100,
    ) -> list[OrganizationPlugin]:
        query = (
            select(OrganizationPlugin)
            .options(selectinload(OrganizationPlugin.plugin))
            .where(OrganizationPlugin.org_id == org_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return list(result.scalars().all())

    @staticmethod
    async def get_by_slug(
        db: AsyncSession,
        org_id: UUID,
        plugin_slug: str,
    ) -> OrganizationPlugin | None:
        result = await db.execute(
            select(OrganizationPlugin)
            .options(selectinload(OrganizationPlugin.plugin))
            .where(
                and_(
                    OrganizationPlugin.org_id == org_id,
                    OrganizationPlugin.plugin_slug == plugin_slug,
                )
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def install(
        db: AsyncSession,
        org_id: UUID,
        plugin_slug: str,
        plugin_base_url: str,
    ) -> OrganizationPlugin:
        org_plugin = OrganizationPlugin(org_id=org_id, plugin_slug=plugin_slug)
        db.add(org_plugin)
        await db.flush()
        await db.refresh(org_plugin)
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                webhook_url = f"{plugin_base_url}/{plugin_slug}/org-provisioned"
                response = await client.post(webhook_url, json={"org_id": str(org_id)})
                response.raise_for_status()
                logger.info(f"Plugin {plugin_slug} provisioned for org {org_id}")
        except httpx.HTTPError as e:
            logger.error(f"Plugin provisioning webhook failed for {plugin_slug}: {e}")
            raise

        return org_plugin

    @staticmethod
    async def uninstall(
        db: AsyncSession,
        org_id: UUID,
        plugin_slug: str,
    ) -> bool:
        org_plugin = await OrganizationPluginCRUD.get_by_slug(db, org_id, plugin_slug)

        if not org_plugin:
            return False

        await db.delete(org_plugin)
        await db.commit()
        return True

    @staticmethod
    async def count(
        db: AsyncSession,
        org_id: UUID,
    ) -> int:
        from sqlalchemy import func as sql_func

        query = select(sql_func.count(OrganizationPlugin.id)).where(
            OrganizationPlugin.org_id == org_id
        )
        result = await db.execute(query)
        return result.scalar_one()
