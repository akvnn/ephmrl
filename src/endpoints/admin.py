from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from src.crud.admin import AdminCRUD
from src.dependency import get_db
from src.models.user import User
from src.schemas.admin import LLMInstanceResponse
from src.schemas.pagination import PaginationRequest, get_pagination_params
from src.utils import get_current_user_from_cookie
from src.security import UnauthorizedException
from src.constants import ADMIN_IDS

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/get_llm_instances", response_model=list[LLMInstanceResponse])
async def get_llm_instances(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationRequest = Depends(get_pagination_params),
    user: User = Depends(get_current_user_from_cookie),
):
    try:
        if user.id not in ADMIN_IDS:
            raise UnauthorizedException("Unauthorized access")
        instances = await AdminCRUD.get_llm_instances(
            db, pagination.skip, pagination.limit
        )
        return instances
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting LLMInstances: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong.",
        )
