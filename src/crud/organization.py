from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from itertools import groupby


import uuid

from src.crud.user import get_user_by_email
from src.models.permission import Permission
from src.models.role import Role
from src.models.relationship import org_members, user_roles
from src.models.organization import Organization
from src.models.user import User
from src.schemas.role import RoleInfo
from src.schemas.user import UserMemberResponse


async def validate_user_permission_for_org(
    db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID, permission: str
) -> bool:
    """
    Validate if a user has a specific permission in an organization.

    Args:
        db: Database session
        user_id: User UUID
        org_id: Organization UUID
        permission: Permission string to check
    Returns:
        True if user has permission, False otherwise
    """
    query = (
        select(func.count())
        .select_from(user_roles)
        .join(Role, user_roles.c.role_id == Role.id)
        .where(
            user_roles.c.user_id == user_id,
            user_roles.c.org_id == org_id,
            Role.permissions.any(Permission.name == permission),
        )
    )

    result = await db.execute(query)
    count = result.scalar() or 0
    return count > 0


async def get_organization_by_id(
    db: AsyncSession, org_id: uuid.UUID, include_members: bool = False
):
    """
    Get organization by ID.

    Args:
        org_id: Organization UUID
        include_members: Whether to eager load members

    Returns:
        Organization or None if not found
    """
    query = (
        select(Organization)
        .where(Organization.id == org_id)
        .options(selectinload(Organization.plan))
    )

    if include_members:
        query = query.options(selectinload(Organization.members))

    result = await db.execute(query)
    org = result.scalar_one_or_none()
    members_response = []

    if org and include_members:
        user_ids = [member.id for member in org.members]

        roles_query = (
            select(user_roles.c.user_id, Role.name, user_roles.c.assigned_at)
            .select_from(user_roles)
            .join(Role, user_roles.c.role_id == Role.id)
            .where(user_roles.c.org_id == org_id, user_roles.c.user_id.in_(user_ids))
        )

        roles_result = await db.execute(roles_query)
        user_roles_map = {}
        for row in roles_result:
            if row.user_id not in user_roles_map:
                user_roles_map[row.user_id] = []
            user_roles_map[row.user_id].append(
                RoleInfo(name=row.name, assigned_at=row.assigned_at)
            )

        for member in org.members:
            member_el = UserMemberResponse.model_validate(
                {**member.__dict__, "roles": user_roles_map.get(member.id, [])}
            )
            members_response.append(member_el)
        # Alternative approach
        # for member in org.members:
        #     member_data = {
        #         "email": member.email,
        #         "username": member.username,
        #         "full_name": member.full_name,
        #         "avatar_url": member.avatar_url,
        #         "is_active": member.is_active,
        #         "email_verified_at": member.email_verified_at,
        #         "roles": user_roles_map.get(member.id, [])
        #     }
        #     members_response.append(UserMemberResponse(**member_data))
    return org, members_response


async def get_organization_by_slug(
    db: AsyncSession, slug: str, include_members: bool = False
) -> Optional[Organization]:
    """
    Get organization by slug.

    Args:
        slug: Organization slug (URL-friendly identifier)
        include_members: Whether to eager load members

    Returns:
        Organization or None if not found
    """
    query = select(Organization).where(Organization.slug == slug.lower())

    if include_members:
        query = query.options(selectinload(Organization.members))

    result = await db.execute(query)
    return result.scalar_one_or_none()


async def get_user_organizations(
    db: AsyncSession, user_id: uuid.UUID
) -> list[Organization]:
    """
    Get all organizations a user belongs to.

    Args:
        user_id: User UUID

    Returns:
        List of organizations
    """
    result = await db.execute(
        select(Organization)
        .options(selectinload(Organization.plan))
        .join(org_members, Organization.id == org_members.c.org_id)
        .where(org_members.c.user_id == user_id)
        .order_by(Organization.name)
    )
    return result.scalars().all()


async def add_user_to_organization(
    db: AsyncSession,
    user_email: str,
    org_id: uuid.UUID,
    invited_by: Optional[uuid.UUID] = None,
    default_role: str = "member",
) -> bool:
    """
    Add user to organization with default role.
    Idempotent - safe to call multiple times.

    Args:
        user_email: User to add
        org_id: Organization to add user to
        invited_by: Optional user_id of inviter
        default_role: Role name to assign (default: "member")

    Returns:
        True if user was added, False if already a member
    """
    # Get user id from email
    user_id = await get_user_by_email(db, user_email)

    if not user_id:
        return False

    # Add to org_members
    stmt = (
        pg_insert(org_members)
        .values(org_id=org_id, user_id=user_id, invited_by=invited_by)
        .on_conflict_do_nothing()
    )

    result = await db.execute(stmt)
    was_added = result.rowcount > 0

    # Assign default role if user was newly added
    if was_added:
        role_result = await db.execute(select(Role).where(Role.name == default_role))
        role = role_result.scalar_one_or_none()

        if role:
            await db.execute(
                pg_insert(user_roles)
                .values(user_id=user_id, role_id=role.id, org_id=org_id)
                .on_conflict_do_nothing()
            )

    await db.commit()
    return was_added


async def remove_user_from_organization(
    db: AsyncSession, user_email: str, org_id: uuid.UUID
) -> bool:
    """
    Remove user from organization.
    Cascades to remove all role assignments in this org.

    Args:
        user_email: User to remove
        org_id: Organization to remove from

    Returns:
        True if user was removed, False if wasn't a member
    """

    # Get user id from email
    user_id = await get_user_by_email(db, user_email)

    if not user_id:
        return False

    # Remove from org_members (primary relationship)
    result = await db.execute(
        delete(org_members).where(
            org_members.c.user_id == user_id, org_members.c.org_id == org_id
        )
    )
    was_removed = result.rowcount > 0

    # Clean up role assignments
    await db.execute(
        delete(user_roles).where(
            user_roles.c.user_id == user_id, user_roles.c.org_id == org_id
        )
    )

    await db.commit()
    return was_removed


async def is_organization_member(
    db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID
) -> bool:
    """
    Check if user is a member of organization.

    Args:
        user_id: User UUID
        org_id: Organization UUID

    Returns:
        True if user is a member, False otherwise
    """
    result = await db.execute(
        select(org_members).where(
            org_members.c.user_id == user_id, org_members.c.org_id == org_id
        )
    )
    return result.first() is not None


async def get_organization_members(
    db: AsyncSession, org_id: uuid.UUID, include_roles: bool = False
) -> list[User] | list[dict]:
    """
    Get all members of an organization.

    Args:
        org_id: Organization UUID
        include_roles: Whether to include role information

    Returns:
        If include_roles=False: List of User objects
        If include_roles=True: List of dicts with user and roles
    """
    if not include_roles:
        query = (
            select(User)
            .join(org_members, User.id == org_members.c.user_id)
            .where(org_members.c.org_id == org_id)
            .order_by(User.username)
        )
        result = await db.execute(query)
        return result.scalars().all()

    # When include_roles=True
    query = (
        select(User, Role)
        .join(user_roles, User.id == user_roles.c.user_id)
        .join(Role, Role.id == user_roles.c.role_id)
        .where(user_roles.c.org_id == org_id)
        .order_by(User.username, Role.name)
    )
    result = await db.execute(query)

    # Group roles by user
    members = []
    rows = result.all()  # Get tuples of (User, Role)

    for user_id, group in groupby(rows, key=lambda x: x[0].id):
        group_list = list(group)
        user = group_list[0][0]  # User object
        roles = [row[1] for row in group_list]  # All Role objects

        members.append({"user": user, "roles": roles})

    return members


async def get_organization_member_count(db: AsyncSession, org_id: uuid.UUID) -> int:
    """
    Get count of organization members.

    Args:
        org_id: Organization UUID

    Returns:
        Number of members
    """

    result = await db.execute(
        select(func.count())
        .select_from(org_members)
        .where(org_members.c.org_id == org_id)
    )
    return result.scalar() or 0


async def transfer_organization_ownership(
    db: AsyncSession,
    org_id: uuid.UUID,
    current_owner_id: uuid.UUID,
    new_owner_id: uuid.UUID,
):
    """
    Transfer organization ownership from one user to another.

    Args:
        org_id: Organization UUID
        current_owner_id: Current owner's user UUID
        new_owner_id: New owner's user UUID
    """
    # TODO: Add checks to ensure current_owner_id is indeed owner before transfer
    # Ensure new owner is a member
    is_member = await is_organization_member(db, new_owner_id, org_id)
    if not is_member:
        await add_user_to_organization(db, new_owner_id, org_id)

    # Get owner role
    owner_role = await db.execute(select(Role).where(Role.name == "owner"))
    owner_role = owner_role.scalar_one()

    # Remove owner role from current owner
    await db.execute(
        delete(user_roles).where(
            user_roles.c.user_id == current_owner_id,
            user_roles.c.role_id == owner_role.id,
            user_roles.c.org_id == org_id,
        )
    )

    # Assign owner role to new owner
    await db.execute(
        pg_insert(user_roles)
        .values(user_id=new_owner_id, role_id=owner_role.id, org_id=org_id)
        .on_conflict_do_nothing()
    )

    await db.commit()
