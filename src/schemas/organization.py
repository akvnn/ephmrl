import uuid
from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field
from src.models.organization import Organization
from src.schemas.user import UserMemberResponse


class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationRequest(BaseModel):
    """Base param model"""

    organization_id: str


class OrganizationMemberRequest(OrganizationRequest):
    user_email: str


async def get_org_params(
    id: str = Query(..., alias="organization_id"),
) -> OrganizationRequest:
    """Get organization request params"""
    return OrganizationRequest(organization_id=id)


class OrganizationResponse(BaseModel):
    """Response model"""

    id: uuid.UUID
    name: str
    slug: str
    subscription_status: str

    plan_display_name: str | None = None
    plan_description: str | None = None
    plan_features: dict | None = None

    members: list[UserMemberResponse] | None = None
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_org(cls, org: Organization):
        return cls(
            id=org.id,
            name=org.name,
            slug=org.slug,
            subscription_status=org.subscription_status,
            plan_display_name=org.plan.display_name if org.plan else None,
            plan_description=org.plan.description if org.plan else None,
            plan_features=org.plan.features if org.plan else None,
        )

    @classmethod
    def from_org_with_members(
        cls, org: Organization, members: list[UserMemberResponse]
    ):
        return cls(
            id=org.id,
            name=org.name,
            slug=org.slug,
            subscription_status=org.subscription_status,
            plan_display_name=org.plan.display_name if org.plan else None,
            plan_description=org.plan.description if org.plan else None,
            plan_features=org.plan.features if org.plan else None,
            members=members,
        )
