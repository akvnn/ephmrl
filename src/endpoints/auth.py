import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.dependency import get_db, get_settings
from src.crud import user as crud_user
from src.schemas.user import (
    RefreshTokenRequest,
    UserCreate,
    UserLogin,
    User,
    TokenResponse,
    UserCreateFromAuth0,
)
from src.security import (
    create_access_token,
    create_refresh_token,
    UnauthorizedException,
    UnauthenticatedException,
    auth,
)
from datetime import timedelta
from src.configuration import Settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Native signup with email and password.
    Password is hashed with argon2.
    """
    # Check if user exists
    existing_user = await crud_user.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Create user
    user = await crud_user.create_user_native(db, user_data)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """
    Native login with email and password.
    Returns JWT access token (RS256) and refresh token.
    """
    user = await crud_user.authenticate_user(
        db, credentials.email, credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/oauth/callback", response_model=TokenResponse)
async def oauth_callback(
    auth0_data: UserCreateFromAuth0,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """
    OAuth callback (Google, GitHub, etc. via Auth0).
    Creates or links account, returns tokens.
    Note: this route be called from frontend after Auth0 login. Auth0 redirect will be to the frontend.
    """
    user, is_new = await crud_user.create_or_update_user_from_auth0(db, auth0_data)

    # Create tokens for this user
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    refresh_request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """
    Refresh access token using refresh token.

    The refresh token must be valid and not expired.
    Returns a new access token and a new refresh token.
    """
    try:
        # Decode and verify refresh token
        payload = auth.verify_refresh_token_string(refresh_request.refresh_token)

        # Get user ID from token
        user_id_str: str = payload.get("sub")
        if not user_id_str:
            raise UnauthenticatedException

        # Get user from database
        try:
            user_id = uuid.UUID(user_id_str)
            user = await crud_user.get_user_by_id(db, user_id)
        except ValueError:
            raise UnauthenticatedException

        if not user:
            raise UnauthorizedException("User not found")

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
            )

        # Create new tokens
        new_access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    except UnauthenticatedException:
        raise
    except UnauthorizedException:
        raise
    except Exception as e:
        raise UnauthorizedException(str(e))
