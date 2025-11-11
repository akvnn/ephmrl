from sqlalchemy import Column, String, Boolean, DateTime, func, Index
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid
from src.database import Base


class User(Base):
    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Auth0 identifiers - supports multiple login methods
    auth0_user_ids = Column(ARRAY(String), default=[], nullable=False)

    # User information
    email = Column(String(255), unique=True, nullable=False, index=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    username = Column(String(100), unique=True, nullable=True)

    # Password hash for native auth
    password_hash = Column(String(255), nullable=True)
    # Only set for native signup, null for OAuth-only users

    # Profile
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Account status
    is_active = Column(Boolean, default=True, nullable=False)

    # Auth metadata
    auth_providers = Column(ARRAY(String), default=[], nullable=False)
    primary_auth_provider = Column(String(50), nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Indexes
    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
        Index("ix_users_auth0_ids", "auth0_user_ids", postgresql_using="gin"),
    )
