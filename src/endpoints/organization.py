import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from src.dependency import get_db
from src.models.user import User
from src.schemas.organization import (
    OrganizationRequest,
    get_org_params,
    OrganizationResponse,
    OrganizationMemberRequest,
)
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from src.security import UnauthorizedException
from src.utils import get_current_user_from_cookie
from src.crud.organization import (
    get_organization_by_id,
    get_user_organizations,
    remove_user_from_organization,
    validate_user_permission_for_org,
    add_user_to_organization,
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


# TODO: change this to invite member rather than direct addition
@router.get("/members/add")
async def add_member(
    params: OrganizationMemberRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    try:
        has_perm = await validate_user_permission_for_org(
            db, user.id, uuid.UUID(params.organization_id), "members.invite"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission or organization does not exist."
            )
        is_added = await add_user_to_organization(
            db, params.user_email, org_id=params.organization_id, invited_by=user.id
        )
        if not is_added:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to add user. Make sure the user email is correct.",
            )
        return JSONResponse(
            content={"message": "User added"},
            media_type="application/json",
            status_code=status.HTTP_200_OK,
        )
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organization members: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/members/remove")
async def remove_member(
    params: OrganizationMemberRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    try:
        has_perm = await validate_user_permission_for_org(
            db, user.id, uuid.UUID(params.organization_id), "members.remove"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission or organization does not exist."
            )
        is_removed = await remove_user_from_organization(
            db, params.user_email, org_id=params.organization_id
        )
        if not is_removed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unable to remove user. Make sure the user email is correct.",
            )
        return JSONResponse(
            content={"message": "User removed"},
            media_type="application/json",
            status_code=status.HTTP_200_OK,
        )
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organization members: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")
