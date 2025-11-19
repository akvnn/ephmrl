from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from src.dependency import get_db, get_settings
from src.crud import user as crud_user
from src.models.user import TokenFunctions, User
from src.schemas.user import PasswordResetRequest, PasswordResetConfirm, PasswordChange
from src.security import (
    hash_password,
    verify_password,
)
from src.configuration import Settings
from src.utils import get_current_user_from_cookie
from src.tasks.email import (
    send_password_reset_email,
    generate_verification_token,
    store_user_token,
    verify_user_token,
    update_verification_status,
)

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/verify")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """
    Verify user's email address via token from email link.
    """
    user_id = await verify_user_token(db, token, TokenFunctions.VERIFY_EMAIL.value)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used token",
        )

    is_updated = await update_verification_status(db, user_id)
    if not is_updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong",
        )
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Email verified successfully"},
    )


@router.post("/password/reset-request")
async def request_password_reset(
    request: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
):
    """Request a password reset."""
    user = await crud_user.get_user_by_email(
        db, request.email, primary_auth_provider_assert="ephmrl"
    )

    if user:
        token = generate_verification_token()
        await store_user_token(
            db, user.id, token, TokenFunctions.RESET_PASSWORD.value, expiry_hours=1
        )

        background_tasks.add_task(
            send_password_reset_email, user.email, token, settings
        )
    return JSONResponse(
        content={
            "message": "If that email exists, a password reset link has been sent."
        },
        media_type="application/json",
        status_code=status.HTTP_200_OK,
    )


@router.post("/password/reset-confirm")
async def confirm_password_reset(
    request: PasswordResetConfirm, db: AsyncSession = Depends(get_db)
):
    """Reset password using token from email."""
    user_id = await verify_user_token(
        db, request.token, function=TokenFunctions.RESET_PASSWORD.value
    )

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid, expired, or already used token",
        )

    user = await crud_user.get_user_by_id(
        db, user_id, primary_auth_provider_assert="ephmrl"
    )

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    user.password_hash = hash_password(request.new_password)
    await db.commit()

    return JSONResponse(
        content={"message": "Password has been reset successfully."},
        media_type="application/json",
        status_code=status.HTTP_200_OK,
    )


@router.post("/password/change")
async def change_password(
    request: PasswordChange,
    current_user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Change password for authenticated user."""
    # Verify current password
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    # Don't allow same password
    if verify_password(request.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from current password",
        )

    # Update password
    current_user.password_hash = hash_password(request.new_password)
    await db.commit()

    return JSONResponse(
        content={"message": "Password has been changed successfully."},
        media_type="application/json",
        status_code=status.HTTP_200_OK,
    )
