from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.database import Base


class Plugin(Base):
    __tablename__ = "plugins"

    slug = Column(String(100), primary_key=True)

    organization_plugins = relationship("OrganizationPlugin", back_populates="plugin")


class OrganizationPlugin(Base):
    __tablename__ = "organization_plugins"

    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        primary_key=True,
    )
    plugin_slug = Column(
        String(100),
        ForeignKey("plugins.slug", ondelete="CASCADE"),
        primary_key=True,
    )

    # Relationships
    plugin = relationship("Plugin", back_populates="organization_plugins")
    organization = relationship("Organization", back_populates="plugins")
