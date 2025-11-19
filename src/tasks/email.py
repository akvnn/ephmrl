import datetime
import secrets
import uuid
import resend
from loguru import logger
from sqlalchemy import select, not_
from sqlalchemy.ext.asyncio import AsyncSession
from src.configuration import Settings
from src.models.user import User, UserToken


def generate_verification_token() -> str:
    """
    Generate a secure random token for email verification.
    Returns a URL-safe token string.
    """
    # Generate 32 random bytes, convert to URL-safe base64 string
    token = secrets.token_urlsafe(32)
    return token


async def store_user_token(
    db: AsyncSession, user_id: int, token: str, function: str, expiry_hours: int = 2
) -> None:
    """
    Store user token in database with expiration.
    Default expiry is 2 hours.
    """
    # Calculate expiration time
    expires_at = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
        hours=expiry_hours
    )

    # Create token record
    db_token = UserToken(
        user_id=user_id,
        token=token,
        expires_at=expires_at,
        function=function,
        used=False,
    )

    db.add(db_token)
    await db.commit()
    await db.refresh(db_token)

    return None


async def verify_user_token(
    db: AsyncSession, token: str, function: str
) -> uuid.UUID | None:
    """
    Verify token and return user_id if valid.
    Returns None if token is invalid, expired, or already used.
    """
    stmt = select(UserToken).where(
        UserToken.token == token,
        not_(UserToken.used),
        UserToken.function == function,
        UserToken.expires_at > datetime.datetime.now(datetime.UTC),
    )

    result = await db.execute(stmt)
    db_token = result.scalar_one_or_none()

    if not db_token:
        return None

    # Mark token as used
    db_token.used = True
    await db.commit()

    return db_token.user_id


async def update_verification_status(db: AsyncSession, user_id: uuid.UUID) -> bool:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user:
        user.email_verified_at = datetime.datetime.now(datetime.UTC)
        await db.commit()
        return True
    return False


async def send_verification_email(user_email: str, token: str, settings: Settings):
    resend.api_key = settings.RESEND_API_KEY

    verification_link = f"{settings.FRONTEND_URL}/user/verify?token={token}"

    try:
        resend.Emails.send(
            {
                "from": "noreply@yourdomain.com",
                "to": user_email,
                "subject": "Verify your email",
                "html": f"<p>Click <a href='{verification_link}'>here</a> to verify</p>",
            }
        )
    except Exception as e:
        logger.error(f"Failed to send verification email to {user_email}: {e}")


async def send_password_reset_email(user_email: str, token: str, settings: Settings):
    resend.api_key = settings.RESEND_API_KEY

    reset_link = f"{settings.FRONTEND_URL}/user/reset-password?token={token}"

    try:
        resend.Emails.send(
            {
                "from": "noreply@yourdomain.com",
                "to": user_email,
                "subject": "Reset your password",
                "html": f"""
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="{reset_link}">Reset Password</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, ignore this email.</p>
            """,
            }
        )
    except Exception as e:
        logger.error(f"Failed to send password reset email to {user_email}: {str(e)}")
