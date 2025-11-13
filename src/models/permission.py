from sqlalchemy import Column, String, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from src.database import Base
from src.models.relationship import role_permissions


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(
        String(100), unique=True, nullable=False
    )  # e.g., "projects.create", "documents.delete"
    resource = Column(
        String(50), nullable=False
    )  # e.g., "projects", "documents", "users"
    action = Column(
        String(50), nullable=False
    )  # e.g., "create", "read", "update", "delete"
    description = Column(String(255), nullable=True)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationship to roles
    roles = relationship(
        "Role",
        secondary=role_permissions,
        back_populates="permissions",
        lazy="selectin",
    )

    __table_args__ = (
        Index("ix_permissions_resource_action", "resource", "action"),
        Index("ix_permissions_name", "name"),
    )
