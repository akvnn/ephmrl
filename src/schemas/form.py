from pydantic import BaseModel, ConfigDict, Field, EmailStr


class FormBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=20)
    last_name: str = Field(..., min_length=1, max_length=20)
    email: EmailStr = Field(..., max_length=255)
    company_name: str | None = Field(None, max_length=100)
    message: str = Field(..., max_length=1000)

    model_config = ConfigDict(from_attributes=True)
