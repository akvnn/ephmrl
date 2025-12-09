"""seed model permissions data

Revision ID: 6193c843d251
Revises: 7a10bf6e5547
Create Date: 2025-11-18 13:03:15.691678

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import UUID
from uuid import UUID as UUID_TYPE

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6193c843d251'
down_revision: Union[str, Sequence[str], None] = '7a10bf6e5547'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ============= Role IDs =============
OWNER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000001')
ADMIN_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000002')
MEMBER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000003')

# ============= Permission IDs =============
# Model Management
MODEL_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000051')
MODEL_CREATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000052')
MODEL_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000053')
MODEL_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000054')
# Plugin Management
PLUGIN_USE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000061')
# Inference Management
INFERENCE_CHAT_ID = UUID_TYPE('20000000-0000-0000-0000-000000000062')

def upgrade() -> None:
    """Insert seed data for permissions"""
    permissions_table = sa.table('permissions',
        sa.column('id', UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('resource', sa.String),
        sa.column('action', sa.String),
        sa.column('description', sa.String),
    )
    
    op.bulk_insert(permissions_table, [
        # Model Management
        {
            'id': MODEL_VIEW_ID,
            'name': 'models.view',
            'resource': 'model',
            'action': 'view',
            'description': 'View model details and settings',
        },
        {
            'id': MODEL_CREATE_ID,
            'name': 'models.create',
            'resource': 'model',
            'action': 'create',
            'description': 'Provision a new model',
        },
        {
            'id': MODEL_UPDATE_ID,
            'name': 'models.update',
            'resource': 'model',
            'action': 'update',
            'description': 'Update model settings',
        },
        {
            'id': MODEL_DELETE_ID,
            'name': 'models.delete',
            'resource': 'model',
            'action': 'delete',
            'description': 'Delete a provisioned model',
        },
        # Plugin Management
        {
            'id': PLUGIN_USE_ID,
            'name': 'plugins.use',
            'resource': 'plugin',
            'action': 'use',
            'description': 'Use installed plugins within the organization',
        },
        # Inference Management
        {
            'id': INFERENCE_CHAT_ID,
            'name': 'inference.chat',
            'resource': 'inference',
            'action': 'chat',
            'description': 'Access chat inference capabilities',
        },
    ])
    op.execute(f"""
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES 
            -- Organization
            ('{OWNER_ROLE_ID}', '{MODEL_VIEW_ID}'),
            ('{OWNER_ROLE_ID}', '{MODEL_CREATE_ID}'),
            ('{OWNER_ROLE_ID}', '{MODEL_UPDATE_ID}'),
            ('{OWNER_ROLE_ID}', '{MODEL_DELETE_ID}'),
            ('{ADMIN_ROLE_ID}', '{MODEL_VIEW_ID}'),
            ('{ADMIN_ROLE_ID}', '{MODEL_CREATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{MODEL_UPDATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{MODEL_DELETE_ID}'),
            ('{MEMBER_ROLE_ID}', '{MODEL_VIEW_ID}'),
            -- Plugins
            ('{OWNER_ROLE_ID}', '{PLUGIN_USE_ID}'),
            ('{ADMIN_ROLE_ID}', '{PLUGIN_USE_ID}'),
            ('{MEMBER_ROLE_ID}', '{PLUGIN_USE_ID}'),
            -- Inference
            ('{OWNER_ROLE_ID}', '{INFERENCE_CHAT_ID}'),
            ('{ADMIN_ROLE_ID}', '{INFERENCE_CHAT_ID}'),
            ('{MEMBER_ROLE_ID}', '{INFERENCE_CHAT_ID}')
        """
    )


def downgrade() -> None:
    """Remove seed data for permissions"""
    op.execute("""
        DELETE FROM permissions 
        WHERE id IN (
            '20000000-0000-0000-0000-000000000051',
            '20000000-0000-0000-0000-000000000052',
            '20000000-0000-0000-0000-000000000053',
            '20000000-0000-0000-0000-000000000054',
            '20000000-0000-0000-0000-000000000061',
            '20000000-0000-0000-0000-000000000062
        )
    """)
