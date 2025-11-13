from sqlalchemy import Column, Integer, String, DateTime, func, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
from src.database import Base
from sqlalchemy.orm import relationship


class CreditTransaction(Base):
    """Audit log for all credit changes"""

    __tablename__ = "credit_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Track which plan this transaction was under
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True)

    # Transaction details
    amount = Column(
        Integer, nullable=False
    )  # Positive for additions, negative for usage
    transaction_type = Column(String(50), nullable=False)
    # Types: "monthly_allocation", "purchase", "usage", "refund", "adjustment"

    # Context
    description = Column(
        String(500), nullable=True
    )  # "API call to /generate", "Monthly renewal"
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )  # Who triggered this?
    detail = Column(
        JSONB, default={}, nullable=False
    )  # Extra context: {"api_endpoint": "/chat", "tokens": 500}

    # Balance tracking
    balance_before = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    organization = relationship("Organization", back_populates="credit_transactions")
    plan = relationship("Plan")
    user = relationship("User")

    __table_args__ = (
        Index("ix_credit_transactions_org_created", "org_id", "created_at"),
        Index("ix_credit_transactions_plan", "plan_id"),
    )
