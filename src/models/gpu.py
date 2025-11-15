from sqlalchemy import (
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


class GPU(Base):
    __tablename__ = "gpus"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)  # e.g., "NVIDIA A100"
    vram_gb = Column(Integer, nullable=False)  # e.g., 40 for 40GB VRAM
    cuda_cores = Column(Integer, nullable=False)  # e.g., 6912
    specs = Column(JSONB, default={}, nullable=False)  # Additional specifications

    current_utilization = Column(
        Integer, default=0, nullable=False
    )  # e.g., percentage 0-100
    max_utilization = Column(Integer, default=100, nullable=False)  # e.g., 100%

    status = Column(String(50), nullable=False)  # e.g., "available", "in_use"

    machine_id = Column(
        UUID(as_uuid=True), ForeignKey("machines.id"), nullable=True
    )  # If assigned to a specific machine

    deleted_at = Column(DateTime(timezone=True), nullable=True)
    expiring_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    llm_instances = relationship(
        "LLMInstance",
        secondary=llm_instance_gpus,
        back_populates="gpus",
        lazy="noload",
    )
    machine = relationship("Machine", back_populates="gpus", lazy="selectin")

    __table_args__ = (Index("ix_gpus_name", "name"),)
