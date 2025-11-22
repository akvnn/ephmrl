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

import random
import string


def generate_slug_suffix(length: int = 6) -> str:
    """Generate a random alphanumeric suffix for slugs"""
    characters = string.ascii_lowercase + string.digits
    return "".join(random.choices(characters, k=length))


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
            path="/auth/refresh",  # Only sent to refresh endpoint
        )


def clear_auth_cookies(response: Response):
    """Clear authentication cookies on logout"""
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/auth/refresh")


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


# Factory function (NOT async) that returns the actual dependency
def factory_get_current_user_from_cookie(load_projects: bool = False):
    # The actual dependency function (IS async)
    async def _get_user(
        payload: Dict = Depends(auth.verify_from_cookie),
        db: AsyncSession = Depends(get_db),
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
                user = await crud_user.get_user_by_id(db, user_id, None, load_projects)
            except ValueError:
                # Not a UUID, must be Auth0 ID
                user = await crud_user.get_user_by_auth0_id(
                    db, user_id_str, load_projects
                )

            if not user:
                raise UnauthorizedException

            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive",
                )

            return user
        except UnauthenticatedException:
            raise
        except UnauthorizedException:
            raise
        except Exception as e:
            raise UnauthorizedException(str(e))

    return _get_user


async def get_current_user_from_cookie(
    payload: Dict = Depends(auth.verify_from_cookie),
    db: AsyncSession = Depends(get_db),
    load_projects: bool = False,
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
            user = await crud_user.get_user_by_id(db, user_id, None, load_projects)
        except ValueError:
            # Not a UUID, must be Auth0 ID
            user = await crud_user.get_user_by_auth0_id(db, user_id_str, load_projects)

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
