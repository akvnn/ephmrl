from fastapi import Query
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime


class LLMSubinstanceBase(BaseModel):
    id: UUID
    org_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    is_dedicated: bool = False


class LLMSubinstanceCreate(LLMSubinstanceBase):
    # in this case (creation), the passed id would be the listed llm id as the user would like to create a subinstance of the listed llm
    pass


class LLMSubinstanceRequest(BaseModel):
    id: UUID
    organization_id: UUID


async def get_llm_subinstance_params(
    id: str = Query(..., alias="id"),
    organization_id: str = Query(..., alias="organization_id"),
) -> LLMSubinstanceRequest:
    """Get LLM Subinstance request params"""
    return LLMSubinstanceRequest(id=id, organization_id=organization_id)


class LLMSubinstanceResponse(
    LLMSubinstanceBase
):  # inherits from listed llm, not a typo
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
