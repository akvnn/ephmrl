from sqlalchemy import Column, ForeignKey, DateTime, Table, func
from sqlalchemy.dialects.postgresql import UUID
from src.database import Base


# Organizations <-> Users (M:N) - Membership
org_members = Table(
    "org_members",
    Base.metadata,
    Column(
        "org_id",
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "joined_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
    Column("invited_by", UUID(as_uuid=True), ForeignKey("users.id"), nullable=True),
)

# Users <-> Roles <-> Organizations (M:N:M)
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column(
        "user_id",
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "role_id",
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "org_id",
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "assigned_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    ),
)

# Roles <-> Permissions (M:N)
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column(
        "role_id",
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "permission_id",
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "granted_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    ),
)

llm_instance_gpus = Table(
    "llm_instance_gpus",
    Base.metadata,
    Column(
        "llm_instance_id",
        UUID(as_uuid=True),
        ForeignKey("llm_instances.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "gpu_id",
        UUID(as_uuid=True),
        ForeignKey("gpus.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)
