"""modify plan seed data for new features

Revision ID: 028bd26b9b6c
Revises: 6193c843d251
Create Date: 2025-11-18 14:01:54.187417

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '028bd26b9b6c'
down_revision: Union[str, Sequence[str], None] = '6193c843d251'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Plan UUIDs
FREE_PLAN_ID = '00000000-0000-0000-0000-000000000001'
STARTER_PLAN_ID = '00000000-0000-0000-0000-000000000002'
PRO_PLAN_ID = '00000000-0000-0000-0000-000000000003'
ENTERPRISE_PLAN_ID = '00000000-0000-0000-0000-000000000004'


def upgrade() -> None:
    """Update plans features to include llm_limits"""
    
    # Update Free Plan
    op.execute(f"""
        UPDATE plans 
        SET features = jsonb_set(
            features - 'advanced_analytics',
            '{{llm_limits}}',
            '{{"max_dedicated_llms": 0, "max_instances": 2, "instance_limits": [{{"max_params": "8B", "max_count": 1}}, {{"max_params": "20B", "max_count": 1}}, {{"max_params": "120B", "max_count": 1}}, {{"max_params": "675B", "max_count": 1}}]}}'::jsonb
        )
        WHERE id = '{FREE_PLAN_ID}'
    """)
    
    # Update Starter Plan
    op.execute(f"""
        UPDATE plans 
        SET features = jsonb_set(
            features - 'advanced_analytics',
            '{{llm_limits}}',
            '{{"max_dedicated_llms": 1, "max_instances": 3, "instance_limits": [{{"max_params": "8B", "max_count": 2}}, {{"max_params": "20B", "max_count": 2}}, {{"max_params": "120B", "max_count": 2}}, {{"max_params": "675B", "max_count": 2}}]}}'::jsonb
        )
        WHERE id = '{STARTER_PLAN_ID}'
    """)
    
    # Update Pro Plan
    op.execute(f"""
        UPDATE plans 
        SET features = jsonb_set(
            features - 'advanced_analytics' - 'custom_integrations',
            '{{llm_limits}}',
            '{{"max_dedicated_llms": 2, "max_instances": 4, "instance_limits": [{{"max_params": "8B", "max_count": 3}}, {{"max_params": "20B", "max_count": 3}}, {{"max_params": "120B", "max_count": 3}}, {{"max_params": "675B", "max_count": 3}}]}}'::jsonb
        )
        WHERE id = '{PRO_PLAN_ID}'
    """)
    
    # Update Enterprise Plan
    op.execute(f"""
        UPDATE plans 
        SET features = jsonb_set(
            features - 'advanced_analytics' - 'custom_integrations' - 'dedicated_support' - 'sla_guarantee' - 'sso',
            '{{llm_limits}}',
            '{{"max_dedicated_llms": null, "max_instances": null, "instance_limits": []}}'::jsonb
        )
        WHERE id = '{ENTERPRISE_PLAN_ID}'
    """)


def downgrade() -> None:
    """Restore original features"""
    
    # Restore Free Plan
    op.execute(f"""
        UPDATE plans 
        SET features = '{{"api_access": false, "priority_support": false, "custom_domain": false, "advanced_analytics": false}}'::jsonb
        WHERE id = '{FREE_PLAN_ID}'
    """)
    
    # Restore Starter Plan
    op.execute(f"""
        UPDATE plans 
        SET features = '{{"api_access": true, "priority_support": false, "custom_domain": false, "advanced_analytics": true}}'::jsonb
        WHERE id = '{STARTER_PLAN_ID}'
    """)
    
    # Restore Pro Plan
    op.execute(f"""
        UPDATE plans 
        SET features = '{{"api_access": true, "priority_support": true, "custom_domain": true, "advanced_analytics": true, "custom_integrations": true}}'::jsonb
        WHERE id = '{PRO_PLAN_ID}'
    """)
    
    # Restore Enterprise Plan
    op.execute(f"""
        UPDATE plans 
        SET features = '{{"api_access": true, "priority_support": true, "custom_domain": true, "advanced_analytics": true, "custom_integrations": true, "dedicated_support": true, "sla_guarantee": true, "sso": true}}'::jsonb
        WHERE id = '{ENTERPRISE_PLAN_ID}'
    """)