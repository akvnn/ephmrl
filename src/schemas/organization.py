from pydantic import BaseModel, ConfigDict
from src.models.organization import Organization


class OrganizationResponse(BaseModel):
    """Response model"""

    name: str
    slug: str
    subscription_status: str

    plan_display_name: str | None = None
    plan_description: str | None = None
    plan_features: dict | None = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_org(cls, org: Organization):
        return cls(
            name=org.name,
            slug=org.slug,
            subscription_status=org.subscription_status,
            plan_display_name=org.plan.display_name if org.plan else None,
            plan_description=org.plan.description if org.plan else None,
            plan_features=org.plan.features if org.plan else None,
        )
