from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from sqlalchemy.orm import defer, load_only
from src.constants import FREE_PLAN_ID, OWNER_ROLE_ID
from src.models.organization import Organization, SubscriptionStatus
from src.models.user import User
from src.schemas.user import UserCreate, UserCreateFromAuth0
from src.models.relationship import org_members, user_roles
from sqlalchemy.orm import selectinload
from src.security import hash_password, verify_password
import datetime
import uuid
from typing import Optional


async def get_user_by_email(
    db: AsyncSession, email: str, primary_auth_provider_assert: str | None = None
) -> Optional[User]:
    stmt = (
        select(User)
        .where(User.email == email.lower())
        .options(defer(User.password_hash))
    )
    if primary_auth_provider_assert:
        stmt = stmt.where(User.primary_auth_provider == primary_auth_provider_assert)

    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_email_no_defer(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


async def get_user_by_id(
    db: AsyncSession,
    user_id: uuid.UUID,
    primary_auth_provider_assert: str | None = None,
    load_projects: bool = False,
) -> Optional[User]:
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(
            load_only(
                User.id,
                User.email,
                User.username,
                User.full_name,
                User.avatar_url,
                User.is_active,
                User.email_verified_at,
                User.password_hash,  # TODO: this is used in change password, check if it has any risk
            )
        )
    )
    if primary_auth_provider_assert:
        stmt = stmt.where(User.primary_auth_provider == primary_auth_provider_assert)
    if load_projects:
        stmt = stmt.options(
            selectinload(User.organizations).selectinload(Organization.projects)
        )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_user_by_auth0_id(
    db: AsyncSession, auth0_user_id: str, load_projects: bool = False
) -> Optional[User]:
    stmt = (
        select(User)
        .where(User.auth0_user_ids.contains([auth0_user_id]))
        .options(
            load_only(
                User.email,
                User.username,
                User.full_name,
                User.avatar_url,
                User.is_active,
                User.email_verified_at,
            )
        )
    )
    if load_projects:
        stmt = stmt.options(
            selectinload(User.organizations).selectinload(Organization.projects)
        )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_organization(
    db: AsyncSession,
    name: str,
    slug: str,
    creator_user_id: uuid.UUID,
    commit: bool = True,
) -> Organization:
    """
    Create a new organization and assign creator as owner.

    Args:
        name: Organization display name
        slug: Unique URL-friendly identifier
        creator_user_id: User who creates the org (becomes owner)
        commit: Whether to commit the transaction

    Returns:
        Created Organization object
    """
    # free_plan = await db.execute(select(Plan).where(Plan.name == PlanType.FREE.value))
    # free_plan = free_plan.scalar_one()

    org = Organization(
        name=name,
        slug=slug.lower(),
        plan_id=FREE_PLAN_ID,
        subscription_status=SubscriptionStatus.ACTIVE.value,
    )

    db.add(org)
    await db.flush()  # Get org.id before adding relationships

    # Add creator as member
    await db.execute(insert(org_members).values(org_id=org.id, user_id=creator_user_id))

    # Assign owner role to creator
    # owner_role = await db.execute(select(Role).where(Role.name == "owner"))
    # owner_role = owner_role.scalar_one()

    await db.execute(
        insert(user_roles).values(
            user_id=creator_user_id, role_id=OWNER_ROLE_ID, org_id=org.id
        )
    )
    if commit:
        await db.commit()
        await db.refresh(org)
    return org


async def create_user_native(db: AsyncSession, user: UserCreate) -> User:
    """
    Create user with native signup (email + password)
    Password is hashed with argon2
    """
    # Generate Auth0-style user ID for native ephmrl users
    native_auth0_id = f"ephmrl|{uuid.uuid4()}"

    db_user = User(
        email=user.email.lower(),
        username=user.username,
        full_name=user.full_name,
        password_hash=hash_password(user.password),
        auth0_user_ids=[native_auth0_id],
        auth_providers=["ephmrl"],
        primary_auth_provider="ephmrl",
        email_verified_at=None,  # Require email verification
    )
    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)
    return db_user


async def create_user_with_org_native(db: AsyncSession, user: UserCreate) -> User:
    # Generate Auth0-style user ID for native ephmrl users
    native_auth0_id = f"ephmrl|{uuid.uuid4()}"

    db_user = User(
        email=user.email.lower(),
        username=user.username,
        full_name=user.full_name,
        password_hash=hash_password(user.password),
        auth0_user_ids=[native_auth0_id],
        auth_providers=["ephmrl"],
        primary_auth_provider="ephmrl",
        email_verified_at=None,  # Require email verification
    )
    db.add(db_user)
    await db.flush()  # Only flush once here

    org_name = f"{db_user.username}'s Organization"
    org_slug = f"{db_user.username}-{str(db_user.id)[:6]}".lower()

    await create_organization(
        db=db, name=org_name, slug=org_slug, creator_user_id=db_user.id, commit=False
    )

    # Commit everything together
    await db.commit()
    await db.refresh(db_user)

    return db_user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """
    Authenticate user with email and password
    Returns user if credentials are valid, None otherwise
    """
    user = await get_user_by_email_no_defer(db, email)

    if not user:
        return None

    if not user.password_hash:
        # User signed up via OAuth only, no password set
        return None

    if not verify_password(password, user.password_hash):
        return None

    if not user.is_active:
        return None

    # Update last login
    user.last_login = datetime.datetime.now(datetime.UTC)
    await db.flush()

    return user


async def link_auth_provider(
    db: AsyncSession,
    user: User,
    auth0_user_id: str,
    auth_provider: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """Link OAuth provider to existing account"""
    if auth0_user_id not in user.auth0_user_ids:
        user.auth0_user_ids = user.auth0_user_ids + [auth0_user_id]

    if auth_provider not in user.auth_providers:
        user.auth_providers = user.auth_providers + [auth_provider]

    if full_name and not user.full_name:
        user.full_name = full_name
    if avatar_url and not user.avatar_url:
        user.avatar_url = avatar_url

    # OAuth providers verify email
    if auth_provider in ["google", "github", "microsoft"]:
        user.email_verified_at = datetime.datetime.now(datetime.UTC)

    user.last_login = datetime.datetime.now(datetime.UTC)

    await db.flush()
    await db.refresh(user)
    return user


async def create_or_update_user_from_auth0(
    db: AsyncSession, auth0_data: UserCreateFromAuth0
) -> tuple[User, bool]:
    """
    Create or link OAuth user
    Returns (user, is_new_account)
    """
    email = auth0_data.email.lower()

    # Check if user exists with this Auth0 ID
    existing_user = await get_user_by_auth0_id(db, auth0_data.auth0_user_id)

    if existing_user:
        existing_user.last_login = datetime.datetime.now(datetime.UTC)
        if auth0_data.full_name and not existing_user.full_name:
            existing_user.full_name = auth0_data.full_name
        if auth0_data.avatar_url and not existing_user.avatar_url:
            existing_user.avatar_url = auth0_data.avatar_url
        await db.flush()
        await db.refresh(existing_user)
        return existing_user, False

    # Check if user exists by email (account linking)
    existing_by_email = await get_user_by_email(db, email)

    if existing_by_email:
        linked_user = await link_auth_provider(
            db,
            existing_by_email,
            auth0_data.auth0_user_id,
            auth0_data.auth_provider,
            auth0_data.full_name,
            auth0_data.avatar_url,
        )
        return linked_user, False

    # Create new user
    db_user = User(
        email=email,
        auth0_user_ids=[auth0_data.auth0_user_id],
        auth_providers=[auth0_data.auth_provider],
        primary_auth_provider=auth0_data.auth_provider,
        full_name=auth0_data.full_name,
        avatar_url=auth0_data.avatar_url,
        email_verified_at=datetime.datetime.now(datetime.UTC),
        last_login=datetime.datetime.now(datetime.UTC),
        password_hash=None,  # No password for OAuth users
    )
    db.add(db_user)
    await db.flush()

    org_name = f"{db_user.username}'s Organization"
    org_slug = f"{db_user.username}-{str(db_user.id)[:6]}".lower()

    await create_organization(
        db=db, name=org_name, slug=org_slug, creator_user_id=db_user.id, commit=False
    )

    # Commit everything together
    await db.commit()
    await db.refresh(db_user)
    return db_user, True
