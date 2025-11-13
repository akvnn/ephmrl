from sqlalchemy import Column, String, Index
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.relationship import role_permissions


class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)  # e.g., "admin", "member", "viewer"
    description = Column(String(255), nullable=True)

    # Relationship to permissions
    permissions = relationship(
        "Permission",
        secondary=role_permissions,
        back_populates="roles",
        lazy="selectin",
    )
    # Note: No direct relationship to users here because
    # user_roles is a 3-way relationship (user + role + org)

    # Note: roles are NOT unique globally, they're reused across orgs
    __table_args__ = (Index("ix_roles_name", "name"),)
