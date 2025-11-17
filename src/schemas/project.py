from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
import uuid

from src.schemas.organization import OrganizationResponse


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None, max_length=255)
    additional_metadata: dict = Field(default_factory=dict)


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = Field(None, max_length=255)
    additional_metadata: dict = Field(default_factory=dict)


class ProjectResponse(ProjectBase):
    id: uuid.UUID
    org_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectWithOrg(ProjectResponse):
    organization: OrganizationResponse

    model_config = ConfigDict(from_attributes=True)
