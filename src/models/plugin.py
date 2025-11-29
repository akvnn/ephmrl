from sqlalchemy import Column, String, ForeignKey, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database import Base
import uuid


class Plugin(Base):
    __tablename__ = "plugins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(100), unique=True, nullable=False)

    organization_plugins = relationship(
        "OrganizationPlugin", back_populates="plugin", lazy="noload"
    )


class OrganizationPlugin(Base):
    __tablename__ = "organization_plugins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
    )
    plugin_slug = Column(
        String(100),
        ForeignKey("plugins.slug", ondelete="CASCADE"),
    )
    status = Column(
        String(50), nullable=False, default="enabled"
    )  # e.g., "enabled", "disabled"

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    plugin = relationship(
        "Plugin", back_populates="organization_plugins", lazy="joined"
    )
    organization = relationship("Organization", back_populates="plugins", lazy="joined")
