import uuid
from fastapi import APIRouter, Depends, HTTPException
from src.dependency import get_db
from src.models.user import User
from src.schemas.organization import (
    OrganizationRequest,
    get_org_params,
    OrganizationResponse,
)
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from src.security import UnauthorizedException
from src.utils import get_current_user_from_cookie
from src.crud.organization import (
    get_organization_by_id,
    get_user_organizations,
    validate_user_permission_for_org,
)

router = APIRouter(prefix="/organization", tags=["organization"])


@router.get("/me", response_model=list[OrganizationResponse])
async def get_current_orgs(
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    try:
        organizations = await get_user_organizations(db, user.id)
        return [OrganizationResponse.from_org(org) for org in organizations]
    except Exception as e:
        logger.error(f"Error fetching organizations for user {user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/members", response_model=OrganizationResponse)
async def get_org_members(
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    try:
        has_perm = await validate_user_permission_for_org(
            db, user.id, uuid.UUID(params.organization_id), "members.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission or organization does not exist."
            )
        organization, members = await get_organization_by_id(
            db, params.organization_id, include_members=True
        )
        return OrganizationResponse.from_org_with_members(organization, members)
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organization members: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")
