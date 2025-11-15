from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    func,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from src.database import Base
from sqlalchemy.orm import relationship


class HostingContract(Base):
    # TODO: modify fields as needed

    __tablename__ = "hosting_contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    price_per_hour = Column(Integer, nullable=False)
    org_verification_details = Column(JSONB, default={}, nullable=False)

    expiring_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    machines = relationship("Machine", back_populates="hosting_contract")
