from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from datetime import datetime

from src.schemas.role import RoleInfo


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


# class RefreshTokenRequest(BaseModel):
#     """Request to refresh access token"""

#     refresh_token: str


# class TokenResponse(BaseModel):
#     """Token response for native auth"""

#     access_token: str
#     refresh_token: str
#     token_type: str = "bearer"
#     expires_in: int  # seconds


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


class UserResponse(UserBase):
    """Response model"""

    avatar_url: str | None = None
    is_active: bool
    email_verified_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class UserMemberResponse(UserResponse):
    """Member response model"""

    roles: list[
        RoleInfo
    ] = []  # Note: this will always be one role per user in current implementation

    model_config = ConfigDict(from_attributes=True)


class PasswordResetRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def email_to_lowercase(cls, v: str) -> str:
        return v.lower()


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
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


class PasswordChange(BaseModel):
    """For authenticated users changing their own password"""

    current_password: str
    new_password: str

    @field_validator("new_password")
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
