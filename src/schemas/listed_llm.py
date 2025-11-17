from pydantic import BaseModel, ConfigDict
from uuid import UUID


class ListedLLMBase(BaseModel):
    id: UUID  # LISTED LLM ID (USER FACING)
    name: str
    model_name: str
    slug: str
    description: str | None = None


class ListedLLMResponse(ListedLLMBase):
    model_config = ConfigDict(from_attributes=True)
