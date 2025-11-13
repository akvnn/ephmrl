"""seed plans data

Revision ID: 93f78b911def
Revises: bb188663be94
Create Date: 2025-11-14 00:59:21.490778

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import UUID, JSONB
from uuid import UUID as UUID_TYPE

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '93f78b911def'
down_revision: Union[str, Sequence[str], None] = 'bb188663be94'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define consistent UUIDs for plans (same across all environments)
FREE_PLAN_ID = UUID_TYPE('00000000-0000-0000-0000-000000000001')
STARTER_PLAN_ID = UUID_TYPE('00000000-0000-0000-0000-000000000002')
PRO_PLAN_ID = UUID_TYPE('00000000-0000-0000-0000-000000000003')
ENTERPRISE_PLAN_ID = UUID_TYPE('00000000-0000-0000-0000-000000000004')


def upgrade() -> None:
    """Insert seed data for plans"""
    plans_table = sa.table('plans',
        sa.column('id', UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('display_name', sa.String),
        sa.column('description', sa.String),
        sa.column('price_monthly', sa.Integer),
        sa.column('price_yearly', sa.Integer),
        sa.column('max_members', sa.Integer),
        sa.column('max_projects', sa.Integer),
        sa.column('max_storage_gb', sa.Integer),
        sa.column('credits_per_month', sa.Integer),
        sa.column('features', JSONB),
        sa.column('is_active', sa.Boolean),
    )
    
    op.bulk_insert(plans_table, [
        {
            'id': FREE_PLAN_ID,
            'name': 'free',
            'display_name': 'Free Plan',
            'description': 'Perfect for getting started',
            'price_monthly': 0,
            'price_yearly': None,
            'max_members': 3,
            'max_projects': 5,
            'max_storage_gb': 1,
            'credits_per_month': 100,
            'features': {
                'api_access': False,
                'priority_support': False,
                'custom_domain': False,
                'advanced_analytics': False,
            },
            'is_active': True,
        },
        {
            'id': STARTER_PLAN_ID,
            'name': 'starter',
            'display_name': 'Starter Plan',
            'description': 'Great for small teams',
            'price_monthly': 2900,  # $29.00
            'price_yearly': 29000,  # $290.00
            'max_members': 10,
            'max_projects': 20,
            'max_storage_gb': 10,
            'credits_per_month': 1000,
            'features': {
                'api_access': True,
                'priority_support': False,
                'custom_domain': False,
                'advanced_analytics': True,
            },
            'is_active': True,
        },
        {
            'id': PRO_PLAN_ID,
            'name': 'pro',
            'display_name': 'Pro Plan',
            'description': 'For growing businesses',
            'price_monthly': 9900,  # $99.00
            'price_yearly': 99000,  # $990.00
            'max_members': 50,
            'max_projects': None,  # unlimited
            'max_storage_gb': 100,
            'credits_per_month': 5000,
            'features': {
                'api_access': True,
                'priority_support': True,
                'custom_domain': True,
                'advanced_analytics': True,
                'custom_integrations': True,
            },
            'is_active': True,
        },
        {
            'id': ENTERPRISE_PLAN_ID,
            'name': 'enterprise',
            'display_name': 'Enterprise Plan',
            'description': 'Custom solutions for large organizations',
            'price_monthly': 49900,  # $499.00
            'price_yearly': 499000,  # $4,990.00
            'max_members': None,  # unlimited
            'max_projects': None,  # unlimited
            'max_storage_gb': None,  # unlimited
            'credits_per_month': 50000,
            'features': {
                'api_access': True,
                'priority_support': True,
                'custom_domain': True,
                'advanced_analytics': True,
                'custom_integrations': True,
                'dedicated_support': True,
                'sla_guarantee': True,
                'sso': True,
            },
            'is_active': True,
        },
    ])


def downgrade() -> None:
    """Remove seed data for plans"""
    op.execute("""
        DELETE FROM plans 
        WHERE id IN (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000002',
            '00000000-0000-0000-0000-000000000003',
            '00000000-0000-0000-0000-000000000004'
        )
    """)