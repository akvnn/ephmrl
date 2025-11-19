import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.crud.organization import OrganizationCRUD
from src.dependency import get_db
from src.crud.llm import LLMSubinstanceCRUD, LLMInstanceCRUD
from src.schemas.llm import (
    LLMSubinstanceCreate,
    LLMSubinstanceRequest,
    LLMSubinstanceResponse,
    get_llm_subinstance_params,
)
from src.schemas.organization import OrganizationRequest, get_org_params
from src.schemas.pagination import PaginationRequest
from src.security import UnauthorizedException
from src.utils import get_current_user_from_cookie
from src.schemas.pagination import get_pagination_params
from src.models.user import User

router = APIRouter(prefix="/llm", tags=["LLM"])


@router.post(
    "/provision",
    response_model=LLMSubinstanceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_llm_subinstance(
    data: LLMSubinstanceCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_from_cookie),
):
    """
    Provision a new LLM subinstance model for your organization.

    This creates a dedicated or shared instance based on the selected LLM.
    """
    org_id = data.org_id

    has_perm = await OrganizationCRUD.validate_user_permission_for_org(
        db, user.id, org_id, "models.create"
    )
    if not has_perm:
        raise UnauthorizedException(
            detail="User does not have permission or organization does not exist."
        )
    remaining_quota = await LLMSubinstanceCRUD.get_org_remaining_quota(
        db, org_id, for_update=True
    )

    listed_llm, llm_instance = await LLMInstanceCRUD.get_llm_from_listed_llm_id(
        db, data.id
    )

    if not await LLMInstanceCRUD.can_provision_instance(
        remaining_quota, listed_llm.base_config.get("parameters"), data.is_dedicated
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot provision instance: quota exceeded",
        )

    llm_instance_id = llm_instance.id if llm_instance else None

    if (
        llm_instance_id is None
        or await LLMInstanceCRUD.check_maximum_tenants_and_dedicated_constraint(
            llm_instance
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM is not available. Please try again later.",
        )
        # TODO: provision a new LLM instance

    subinstance = await LLMSubinstanceCRUD.create(
        db=db,
        org_id=org_id,
        llm_instance_id=llm_instance_id,
        data=data,
        user_id=user.id,
    )
    return subinstance


@router.get(
    "/models/my/all",
    response_model=list[LLMSubinstanceResponse],
)
async def list_llm_subinstances_models(
    db: AsyncSession = Depends(get_db),
    params: OrganizationRequest = Depends(get_org_params),
    pagination: PaginationRequest = Depends(get_pagination_params),
    user: User = Depends(get_current_user_from_cookie),
):
    """
    List all LLM subinstances provisioned for your organization.

    Returns both shared and dedicated instances available to your organization.
    """
    org_id = uuid.UUID(params.organization_id)

    has_perm = await OrganizationCRUD.validate_user_permission_for_org(
        db, user.id, org_id, "models.view"
    )
    if not has_perm:
        raise UnauthorizedException(
            "User does not have permission or organization does not exist."
        )

    subinstances = await LLMSubinstanceCRUD.get_by_org(
        db=db,
        org_id=org_id,
        skip=pagination.skip,
        limit=pagination.limit,
        include_deleted=False,
    )
    return subinstances


@router.get(
    "/models/my",
    response_model=LLMSubinstanceResponse,
)
async def get_llm_subinstance(
    params: LLMSubinstanceRequest = Depends(get_llm_subinstance_params),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_from_cookie),
):
    """
    Get details of a specific LLM subinstance in use or was in use by the organization
    """

    org_id = params.organization_id

    has_perm = await OrganizationCRUD.validate_user_permission_for_org(
        db, user.id, org_id, "models.view"
    )
    if not has_perm:
        raise UnauthorizedException(
            "User does not have permission or organization does not exist."
        )

    subinstance = await LLMSubinstanceCRUD.get_by_id(
        db=db,
        subinstance_id=params.id,
        org_id=org_id,
    )
    if not subinstance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM model not found",
        )
    return subinstance


@router.post(
    "/deprovision",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_llm_subinstance(
    params: LLMSubinstanceRequest = Depends(get_llm_subinstance_params),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_from_cookie),
):
    """
    Deprovision an LLM subinstance.

    Note: This only removes the model from your organization. The underlying
    shared instance may still be used by other organizations.
    """
    org_id = params.organization_id

    has_perm = await OrganizationCRUD.validate_user_permission_for_org(
        db, user.id, org_id, "models.delete"
    )
    if not has_perm:
        raise UnauthorizedException(
            "User does not have permission or organization does not exist."
        )

    hard_delete = False  # only soft deletes for now

    if hard_delete:
        success = await LLMSubinstanceCRUD.hard_delete(
            db=db,
            subinstance_id=params.id,
            org_id=org_id,
        )
    else:
        success = await LLMSubinstanceCRUD.soft_delete(
            db=db,
            subinstance_id=params.id,
            org_id=org_id,
        )

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="LLM model not found",
        )
    # TODO: complete this route and add remaining necessary logic
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)
