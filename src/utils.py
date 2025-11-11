from typing import Dict
from fastapi import HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.security import auth, UnauthorizedException, UnauthenticatedException
from src.models.user import User
from src.crud import user as crud_user
from src.dependency import get_db
import uuid


async def get_current_user(
    payload: Dict = Depends(auth.verify), db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validate JWT token (native RS256 or Auth0) and return user
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
