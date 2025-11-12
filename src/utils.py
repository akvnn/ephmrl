from typing import Dict
from fastapi import HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.security import auth, UnauthorizedException, UnauthenticatedException
from src.models.user import User
from src.crud import user as crud_user
from src.configuration import Environment, config
from src.dependency import get_db
import uuid

from fastapi import Response
from typing import Optional


def set_auth_cookies(
    response: Response, access_token: str, refresh_token: Optional[str] = None
):
    """Set authentication cookies with proper security settings"""
    is_production = config.ENVIRONMENT == Environment.PRODUCTION

    # Access token
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    # Refresh token (if provided)
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=is_production,
            samesite="strict",
            max_age=config.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            path="/api/auth/refresh",  # Only sent to refresh endpoint
        )


def clear_auth_cookies(response: Response):
    """Clear authentication cookies on logout"""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/auth/refresh")


async def get_current_user(
    payload: Dict = Depends(auth.verify), db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validate JWT token (native RS256 or Auth0) using verify method (Bearer) and return user
    """

    try:
        # Get user ID from token
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise UnauthenticatedException

        # For native ephmrl auth, sub is user UUID
        # For Auth0, sub is auth0 user ID
        try:
            user_id = uuid.UUID(user_id_str)
            user = await crud_user.get_user_by_id(db, user_id)
        except ValueError:
            # Not a UUID, must be Auth0 ID
            user = await crud_user.get_user_by_auth0_id(db, user_id_str)

        if not user:
            raise UnauthorizedException

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
            )

        return user
    except UnauthenticatedException:
        raise
    except UnauthorizedException:
        raise
    except Exception as e:
        raise UnauthorizedException(str(e))


async def get_current_user_from_cookie(
    payload: Dict = Depends(auth.verify_from_cookie), db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validate JWT token (native RS256 or Auth0) using verify_from_cookie method (Cookie) and return user
    """

    try:
        # Get user ID from token
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise UnauthenticatedException

        # For native ephmrl auth, sub is user UUID
        # For Auth0, sub is auth0 user ID
        try:
            user_id = uuid.UUID(user_id_str)
            user = await crud_user.get_user_by_id(db, user_id)
        except ValueError:
            # Not a UUID, must be Auth0 ID
            user = await crud_user.get_user_by_auth0_id(db, user_id_str)

        if not user:
            raise UnauthorizedException

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
            )

        return user
    except UnauthenticatedException:
        raise
    except UnauthorizedException:
        raise
    except Exception as e:
        raise UnauthorizedException(str(e))
