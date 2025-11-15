from sqlalchemy import (
    Column,
    String,
    DateTime,
    func,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from src.database import Base
from sqlalchemy.orm import relationship


class Project(Base):
    # Note: documents within each project will be handled externally by llama pg

    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    name = Column(String(100), nullable=False)

    description = Column(String(255), nullable=True)

    additional_metadata = Column(JSONB, default={}, nullable=False)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )  # Who created this?

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("User")

    organization = relationship("Organization", back_populates="projects")
