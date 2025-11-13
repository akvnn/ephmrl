from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, delete
from src.models.role import Role
import uuid
from src.models.relationship import user_roles, org_members
from sqlalchemy.orm import selectinload


async def assign_role_to_user(
    db: AsyncSession, user_id: uuid.UUID, role_name: str, org_id: uuid.UUID
):
    is_member = await db.execute(
        select(org_members).where(
            org_members.c.user_id == user_id, org_members.c.org_id == org_id
        )
    )
    if not is_member.first():
        raise ValueError("User is not a member of this organization")

    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalar_one_or_none()

    if not role:
        raise ValueError(f"Role '{role_name}' not found")

    # Insert with ON CONFLICT DO NOTHING.
    # If the user already has the role in the org, do nothing.
    stmt = (
        insert(user_roles)
        .values(user_id=user_id, role_id=role.id, org_id=org_id)
        .on_conflict_do_nothing()
    )

    await db.execute(stmt)
    await db.commit()


async def user_has_role(
    db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID, role_name: str
) -> bool:
    result = await db.execute(
        select(user_roles)
        .join(Role, Role.id == user_roles.c.role_id)
        .where(
            user_roles.c.user_id == user_id,
            user_roles.c.org_id == org_id,
            Role.name == role_name,
        )
    )
    return result.first() is not None


async def remove_role_from_user(
    db: AsyncSession, user_id: uuid.UUID, role_name: str, org_id: uuid.UUID
):
    result = await db.execute(select(Role).where(Role.name == role_name))
    role = result.scalar_one_or_none()

    if role:
        await db.execute(
            delete(user_roles).where(
                user_roles.c.user_id == user_id,
                user_roles.c.role_id == role.id,
                user_roles.c.org_id == org_id,
            )
        )
        await db.commit()


async def get_user_roles_in_org(
    db: AsyncSession, user_id: uuid.UUID, org_id: uuid.UUID
):
    result = await db.execute(
        select(Role)
        .join(user_roles, Role.id == user_roles.c.role_id)
        .where(user_roles.c.user_id == user_id, user_roles.c.org_id == org_id)
        .options(selectinload(Role.permissions))
    )
    return result.scalars().all()
