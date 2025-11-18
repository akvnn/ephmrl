from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from src.database import Base


class PlanType(str, enum.Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False)
    display_name = Column(String(100), nullable=False)  # "Free Plan", "Pro Plan"
    description = Column(String(500), nullable=True)

    # Pricing
    price_monthly = Column(Integer, nullable=False)  # cents (e.g., 2900 = $29.00)
    price_yearly = Column(Integer, nullable=True)  # cents, null if no yearly option

    # Limits
    max_members = Column(Integer, nullable=True)  # null = unlimited
    max_projects = Column(Integer, nullable=True)  # null = unlimited
    max_storage_gb = Column(Integer, nullable=True)  # null = unlimited
    credits_per_month = Column(Integer, nullable=False)

    # Features (JSON)
    features = Column(JSONB, default={}, nullable=False)
    # Structure:
    # {
    #   "api_access": true,
    #   "priority_support": true,
    #    "custom_domain": true,
    #   "llm_limits": {
    #     "max_dedicated_llms": 2,
    #     "max_instances": 4,
    #     "instance_limits": [
    #       {"max_params": "270B", "max_count": 2},
    #       {"max_params": "70B", "max_count": 2}
    #     ]
    #   }
    # }

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    organizations = relationship(
        "Organization", back_populates="plan", foreign_keys="[Organization.plan_id]"
    )  #  for reverse navigation - lets you query "which organizations are on this plan?"


class PlanChangeHistory(Base):
    """Separate table to track all plan changes"""

    __tablename__ = "plan_change_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Plan change details
    from_plan_id = Column(
        UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True
    )  # Null for first plan
    to_plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)

    # Credit adjustment
    credits_before = Column(Integer, nullable=False)
    credits_after = Column(Integer, nullable=False)
    credits_adjustment = Column(Integer, nullable=False)  # Can be positive or negative

    # Change context
    change_reason = Column(
        String(50), nullable=False
    )  # "upgrade", "downgrade", "trial_end", "admin_change"
    changed_by_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    notes = Column(String(500), nullable=True)

    # Effective date
    effective_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Relationships
    organization = relationship("Organization")
    from_plan = relationship("Plan", foreign_keys=[from_plan_id])
    to_plan = relationship("Plan", foreign_keys=[to_plan_id])
    changed_by = relationship("User")

    __table_args__ = (Index("ix_plan_changes_org", "org_id", "created_at"),)
