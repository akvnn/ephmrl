from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    func,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from src.database import Base
from sqlalchemy.orm import relationship
from src.models.relationship import org_members


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)

    # Subscription
    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    subscription_status = Column(String(50), nullable=False)
    subscription_auto_renews = Column(Boolean, default=True, nullable=False)
    subscription_canceled_at = Column(
        DateTime(timezone=True), nullable=True
    )  # details would be in PlanChangeHistory to free plan
    subscription_ends_at = Column(
        DateTime(timezone=True), nullable=True
    )  # e.g., 7 day trial would end in 7 days

    # Track plan changes
    previous_plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=True)
    plan_changed_at = Column(DateTime(timezone=True), nullable=True)

    # Credits
    credits_balance = Column(
        Integer, default=0, nullable=False
    )  # Current available credits
    credits_used_this_period = Column(
        Integer, default=0, nullable=False
    )  # Resets monthly
    billing_period_start = Column(DateTime(timezone=True), nullable=True)
    billing_period_end = Column(DateTime(timezone=True), nullable=True)

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
    # Organization -> Users (who are members)
    # TODO: potentially change lazy to noload to avoid unnecessary loading
    members = relationship(
        "User",
        secondary=org_members,
        back_populates="organizations",
        lazy="selectin",
        primaryjoin="Organization.id == org_members.c.org_id",
        secondaryjoin="User.id == org_members.c.user_id",
    )
    # Organization -> Plan
    plan = relationship("Plan", foreign_keys=[plan_id], back_populates="organizations")
    previous_plan = relationship("Plan", foreign_keys=[previous_plan_id])
    # Organization -> Project
    projects = relationship("Project", back_populates="organization")
    # Organization -> CreditTransactions
    credit_transactions = relationship(
        "CreditTransaction", back_populates="organization"
    )
    llm_subinstances = relationship("LLMSubinstance", back_populates="organization")
    machines = relationship("Machine", back_populates="organization")
    plugins = relationship("OrganizationPlugin", back_populates="organization")
