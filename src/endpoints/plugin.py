from fastapi import APIRouter, Request, Response, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from src.crud import plugin as plugin_crud
from src.dependency import get_db
from src.models.user import User
from src.utils import get_current_user_from_cookie
from loguru import logger

router = APIRouter(prefix="/plugins", tags=["plugins"])


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
):
    try:
        plugin = await plugin_crud.get_plugin_by_slug(db, plugin_slug)
        if not plugin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Plugin '{plugin_slug}' not found",
            )

        org_id = request.query_params.get("organization_id")
        if not org_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="organization_id required",
            )

        target_url = f"{plugin.url}/{path}"
        if request.url.query:
            target_url += f"?{request.url.query}"

        headers = dict(request.headers)
        headers["X-User-ID"] = str(user.id)
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
