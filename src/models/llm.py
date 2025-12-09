from sqlalchemy import (
    Boolean,
    Column,
    Integer,
    String,
    DateTime,
    func,
    Index,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from src.database import Base
from sqlalchemy.orm import relationship
from src.models.relationship import llm_instance_gpus


class LLMSubinstance(Base):
    __tablename__ = "llm_subinstances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )
    llm_instance_id = Column(
        UUID(as_uuid=True),
        ForeignKey("llm_instances.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Context
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )  # Who created this?
    name = Column(String(255), nullable=False)
    base_config = Column(
        JSONB, default={}, nullable=False
    )  # Configuration details for the subinstance

    # Balance tracking
    credit_price_per_hour = Column(
        Integer, nullable=False
    )  # Credits charged per hour of usage

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    deleted_at = Column(DateTime(timezone=True), nullable=True)

    is_dedicated = Column(Boolean, default=False, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="llm_subinstances")
    user = relationship("User")
    llm_instance = relationship(
        "LLMInstance", back_populates="llm_subinstances", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_llm_subinstances_org_created", "org_id", "created_at"),
        Index("ix_llm_subinstances_user", "user_id"),
    )


class LLMInstance(Base):
    """"""

    __tablename__ = "llm_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)  # display name
    model_name = Column(String(100), nullable=False)  # e.g., "llama4"
    model_type = Column(String(50), nullable=False)  # e.g., "chat", "completion"
    base_config = Column(
        JSONB, default={}, nullable=False
    )  # Default configuration for this model
    provider_config = Column(
        JSONB, default={}, nullable=False
    )  # Provider specific configuration
    status = Column(String(50), nullable=False)  # e.g., "active", "down"
    maximum_tenants = Column(
        Integer, nullable=False
    )  # only if llm subinstance is not dedicated, otherwise ignored
    listed_llm_id = Column(
        UUID(as_uuid=True), ForeignKey("listed_llms.id"), nullable=False
    )
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    llm_subinstances = relationship(
        "LLMSubinstance", back_populates="llm_instance", lazy="noload"
    )  # eager

    listed_llm = relationship(
        "ListedLLM", back_populates="llm_instance", lazy="selectin"
    )  # eager

    gpus = relationship(
        "GPU",
        secondary=llm_instance_gpus,
        back_populates="llm_instances",
        lazy="selectin",
    )


class ListedLLM(Base):
    __tablename__ = "listed_llms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # display name
    description = Column(String(255), nullable=False)  # description
    model_name = Column(String(100), nullable=False)  # e.g., "llama4"
    slug = Column(String(100), nullable=True)  # slug
    image_location = Column(
        String(255), nullable=True
    )  # docker image from which this will be built
    # provider = Column(String(100), nullable=False)  # e.g., "vLLM"
    base_config = Column(
        JSONB, default={}, nullable=False
    )  # Default configuration for this model. Includes number of parameters.
    status = Column(String(50), nullable=False)  # e.g., "live", "deleted"

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    llm_instance = relationship(
        "LLMInstance", back_populates="listed_llm", lazy="noload"
    )  # not necessary but allows to get instance for each listedllm for admin dashboard
