import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from src.dependency import get_db
from src.models.user import User
from src.schemas.pagination import (
    PaginationRequest,
    SearchPaginationRequest,
    get_pagination_params,
    get_search_pagination_params,
)
from src.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithOrg,
)
from src.schemas.organization import OrganizationRequest, get_org_params
from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession
from src.security import UnauthorizedException
from src.utils import get_current_user_from_cookie
from src.crud.project import ProjectCRUD
from src.crud.organization import OrganizationCRUD

router = APIRouter(prefix="/project", tags=["project"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Create a new project"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.create"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to create projects in this organization."
            )

        project = await ProjectCRUD.create(db, project_data, user.id, org_id)
        return ProjectResponse.model_validate(project)
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error creating project: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/me", response_model=list[ProjectResponse])
async def list_projects(
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    pagination: PaginationRequest = Depends(get_pagination_params),
    db: AsyncSession = Depends(get_db),
):
    """List all projects in an organization"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to view projects in this organization."
            )

        projects = await ProjectCRUD.get_all(
            db,
            org_id,
            skip=pagination.skip,
            limit=pagination.limit,
            include_deleted=False,
        )
        return [ProjectResponse.model_validate(project) for project in projects]
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error listing projects: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/search", response_model=list[ProjectResponse])
async def search_projects(
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    pagination: SearchPaginationRequest = Depends(get_search_pagination_params),
    db: AsyncSession = Depends(get_db),
):
    """Search projects by name"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to search projects in this organization."
            )

        projects = await ProjectCRUD.search_by_name(
            db, org_id, pagination.q, skip=pagination.skip, limit=pagination.limit
        )
        return [ProjectResponse.model_validate(project) for project in projects]
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error searching projects: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/count")
async def count_projects(
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Count projects in an organization"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission or organization does not exist."
            )

        count = await ProjectCRUD.count(db, org_id, include_deleted=False)
        return {"count": count}
    except UnauthorizedException:
        raise
    except Exception as e:
        logger.error(f"Error counting projects: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.get("/{project_id}", response_model=ProjectWithOrg)
async def get_project(
    project_id: uuid.UUID,
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific project by ID"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.view"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission or organization does not exist."
            )

        project = await ProjectCRUD.get_by_id_with_relations(
            db, project_id, org_id, include_deleted=False
        )

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

        return ProjectWithOrg.model_validate(project)
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    project_data: ProjectUpdate,
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Update a project"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.update"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to update projects in this organization."
            )

        project = await ProjectCRUD.update(db, project_id, org_id, project_data)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

        return ProjectResponse.model_validate(project)
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.patch("/{project_id}/metadata", response_model=ProjectResponse)
async def update_project_metadata(
    project_id: uuid.UUID,
    metadata: dict,
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Update project metadata"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.update"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to update projects in this organization."
            )

        merge = False  # only replace for now
        project = await ProjectCRUD.update_metadata(
            db, project_id, org_id, metadata, merge=merge
        )

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

        return ProjectResponse.model_validate(project)
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project metadata {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: uuid.UUID,
    params: OrganizationRequest = Depends(get_org_params),
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Delete a project (soft delete by default)"""
    try:
        org_id = uuid.UUID(params.organization_id)

        has_perm = await OrganizationCRUD.validate_user_permission_for_org(
            db, user.id, org_id, "projects.delete"
        )
        if not has_perm:
            raise UnauthorizedException(
                "User does not have permission to delete projects in this organization."
            )

        hard = False  # only soft delete for now
        if hard:
            success = await ProjectCRUD.hard_delete(db, project_id, org_id)
        else:
            success = await ProjectCRUD.soft_delete(db, project_id, org_id)

        if not success:
            raise HTTPException(status_code=404, detail="Project not found.")

        return JSONResponse(status_code=status.HTTP_204_NO_CONTENT, content=None)
    except UnauthorizedException:
        raise
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Something went wrong.")


# @router.post("/{project_id}/restore", response_model=ProjectResponse)
# async def restore_project(
#     project_id: uuid.UUID,
#     params: OrganizationRequest = Depends(get_org_params),
#     user: User = Depends(get_current_user_from_cookie),
#     db: AsyncSession = Depends(get_db),
# ):
#     """Restore a soft-deleted project"""
#     try:
#         org_id = uuid.UUID(params.organization_id)

#         has_perm = await OrganizationCRUD.validate_user_permission_for_org(
#             db, user.id, org_id, "projects.delete"
#         )
#         if not has_perm:
#             raise UnauthorizedException(
#                 "User does not have permission to restore projects in this organization."
#             )

#         project = await ProjectCRUD.restore(db, project_id, org_id)

#         if not project:
#             raise HTTPException(
#                 status_code=404,
#                 detail="Project not found or not deleted.",
#             )

#         return ProjectResponse.model_validate(project)
#     except UnauthorizedException:
#         raise
#     except HTTPException:
#         raise
#     except Exception as e:
#         logger.error(f"Error restoring project {project_id}: {str(e)}")
#         raise HTTPException(status_code=500, detail="Something went wrong.")
