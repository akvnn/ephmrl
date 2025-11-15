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


class Machine(Base):
    __tablename__ = "machines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)  # e.g., "Machine A"
    ip_address = Column(String(45), nullable=False)  # IPv4 or IPv6
    region = Column(String(100), nullable=False)  # e.g., "us-west-1"
    location = Column(String(255), nullable=True)  # e.g., "Data Center 1"

    provider = Column(String(100), nullable=False)  # e.g., "AWS", "GCP"
    provider_type = Column(String(100), nullable=False)  # e.g., "cloud", "p2p"

    hosted_by_org_id = Column(
        UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True
    )  # If hosted by a specific organization

    status = Column(String(50), nullable=False)  # e.g., "active", "inactive"
    total_number_of_gpus = Column(Integer, nullable=False)
    available_number_of_gpus = Column(Integer, nullable=False)

    hosting_contract_id = Column(
        UUID(as_uuid=True), ForeignKey("hosting_contracts.id"), nullable=True
    )

    specs = Column(JSONB, default={}, nullable=False)  # Additional specifications

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    gpus = relationship("GPU", back_populates="machine", lazy="selectin")

    organization = relationship(
        "Organization", back_populates="machines", lazy="selectin"
    )

    hosting_contract = relationship(
        "HostingContract", back_populates="machines", lazy="selectin"
    )

    __table_args__ = (
        Index("ix_machines_name", "name"),
        Index("ix_machines_ip_address", "ip_address"),
    )
