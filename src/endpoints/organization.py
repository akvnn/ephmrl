from fastapi import APIRouter, Depends
from src.dependency import get_db
from src.models.user import User
from src.schemas.organization import OrganizationResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.utils import get_current_user_from_cookie
from src.crud.organization import get_user_organizations

router = APIRouter(prefix="/organization", tags=["organization"])


@router.get("/me", response_model=list[OrganizationResponse])
async def get_current_orgs(
    user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    organizations = await get_user_organizations(db, user.id)
    return [OrganizationResponse.from_org(org) for org in organizations]
