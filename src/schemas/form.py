from pydantic import BaseModel, Field


class FormBase(BaseModel):
    fist_name: str = Field(..., min_length=1, max_length=20)
    last_name: str = Field(..., min_length=1, max_length=20)
    email: str = Field(..., max_length=255)
    company_name: str | None = Field(None, max_length=100)
    message: str = Field(..., max_length=1000)
