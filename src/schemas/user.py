from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import List
import uuid


class UserBase(BaseModel):
    email: EmailStr
    username: str | None = None
    full_name: str | None = None

    @field_validator("email")
    @classmethod
    def email_to_lowercase(cls, v: str) -> str:
        return v.lower()


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 128:
            raise ValueError("Password must be at most 128 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """For native login"""

    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def email_to_lowercase(cls, v: str) -> str:
        return v.lower()


class RefreshTokenRequest(BaseModel):
    """Request to refresh access token"""

    refresh_token: str


class TokenResponse(BaseModel):
    """Token response for native auth"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserCreateFromAuth0(BaseModel):
    """For Auth0 OAuth callback"""

    auth0_user_id: str
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    auth_provider: str = "auth0"

    @field_validator("email")
    @classmethod
    def email_to_lowercase(cls, v: str) -> str:
        return v.lower()


class User(UserBase):
    """Response model"""

    id: uuid.UUID
    auth0_user_ids: List[str]
    auth_providers: List[str]
    primary_auth_provider: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    is_active: bool
    email_verified_at: datetime | None = None
    last_login: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
