from fastapi import APIRouter, Request, Response, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

import httpx
from src.crud.organization import OrganizationCRUD
from src.crud.plugin import PluginCRUD, OrganizationPluginCRUD
from src.dependency import get_db, get_settings
from src.models.user import User
from src.security import UnauthorizedException
from src.utils import get_current_user_from_cookie
from src.configuration import Settings
from src.schemas.plugin import InstallPluginRequest, PluginResponse
from uuid import UUID
from loguru import logger
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/plugins", tags=["plugins"])


@router.get("/installed", response_model=list[PluginResponse])
async def get_installed_plugins(
    organization_id: str,
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    try:
        org_id = UUID(organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "organization.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                detail="User does not have permission or organization does not exist."
            )

        plugins = await OrganizationPluginCRUD.get_installed(db, UUID(organization_id))
        plugin_responses = [
            PluginResponse(
                plugin_slug=org_plugin.plugin_slug,
                status=org_plugin.status,
                created_at=org_plugin.created_at,
            )
            for org_plugin in plugins
        ]
        return plugin_responses
    except Exception as e:
        logger.error(f"Error fetching installed plugins: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.api_route(
    "/{plugin_slug}/{path:path}",
    methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    include_in_schema=True,
)
async def proxy_to_plugin(
    plugin_slug: str,
    path: str,
    request: Request,
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    try:
        plugin = await PluginCRUD.get_by_slug(db, plugin_slug)
        if not plugin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plugin '{plugin_slug}' not found",
            )

        organization_id = request.query_params.get("organization_id")
        if not organization_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bad request.",
            )

        org_id = UUID(organization_id)
        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "plugin.use"
        )
        if not has_perm:
            raise UnauthorizedException(
                detail="User does not have permission or organization does not exist."
            )

        target_url = f"{settings.PLUGIN_BASE_URL}/{plugin_slug}/{path}"
        if request.url.query:
            target_url += f"?{request.url.query}&user_id={user.id}"
        else:
            target_url += f"?user_id={user.id}"

        headers = dict(request.headers)
        headers.pop("host", None)

        body = await request.body()

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
            )

            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers),
                media_type=response.headers.get("content-type"),
            )

    except HTTPException:
        raise
    except httpx.RequestError as e:
        logger.error(f"Plugin request failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Plugin service unavailable: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Unexpected error in plugin proxy: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.post("/install")
async def install_plugin(
    request: InstallPluginRequest,
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    try:
        org_id = UUID(request.organization_id)
        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "organization.update"
        )
        if not has_perm:
            raise UnauthorizedException(
                detail="User does not have permission or organization does not exist."
            )

        plugin = await PluginCRUD.get_by_slug(db, request.plugin_slug)
        if not plugin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plugin '{request.plugin_slug}' not found",
            )

        await OrganizationPluginCRUD.install(
            db=db,
            org_id=org_id,
            plugin_slug=request.plugin_slug,
            plugin_base_url=settings.PLUGIN_BASE_URL,
        )

        await db.commit()

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"message": "Plugin installed successfully"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error installing plugin: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong.")
