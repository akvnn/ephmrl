from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.models.plugin import Plugin, OrganizationPlugin
from uuid import UUID
import httpx
from loguru import logger


async def get_plugin_by_slug(db: AsyncSession, slug: str) -> Plugin | None:
    """Get plugin by slug"""
    result = await db.execute(select(Plugin).where(Plugin.slug == slug))
    return result.scalar_one_or_none()


async def install_plugin_for_org(
    db: AsyncSession, org_id: UUID, plugin_slug: str, plugin_base_url: str
) -> OrganizationPlugin:
    org_plugin = OrganizationPlugin(org_id=org_id, plugin_slug=plugin_slug)
    db.add(org_plugin)
    await db.flush()

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
