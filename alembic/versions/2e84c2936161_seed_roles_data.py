"""seed roles data

Revision ID: 2e84c2936161
Revises: 93f78b911def
Create Date: 2025-11-14 01:15:15.974150

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import UUID
from uuid import UUID as UUID_TYPE

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e84c2936161'
down_revision: Union[str, Sequence[str], None] = '93f78b911def'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Define consistent UUIDs for roles (same across all environments)
OWNER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000001')
ADMIN_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000002')
MEMBER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000003')
VIEWER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000004')


def upgrade() -> None:
    """Insert seed data for roles"""
    roles_table = sa.table('roles',
        sa.column('id', UUID(as_uuid=True)),
        sa.column('name', sa.String),
        sa.column('description', sa.String),
    )
    
    op.bulk_insert(roles_table, [
        {
            'id': OWNER_ROLE_ID,
            'name': 'owner',
            'description': 'Organization owner with full control including billing and deletion',
        },
        {
            'id': ADMIN_ROLE_ID,
            'name': 'admin',
            'description': 'Administrator with full permissions except billing and org deletion',
        },
        {
            'id': MEMBER_ROLE_ID,
            'name': 'member',
            'description': 'Standard member with create, read, update permissions',
        },
        {
            'id': VIEWER_ROLE_ID,
            'name': 'viewer',
            'description': 'Read-only access to organization resources',
        },
    ])


def downgrade() -> None:
    """Remove seed data for roles"""
    op.execute("""
        DELETE FROM roles 
        WHERE id IN (
            '10000000-0000-0000-0000-000000000001',
            '10000000-0000-0000-0000-000000000002',
            '10000000-0000-0000-0000-000000000003',
            '10000000-0000-0000-0000-000000000004'
        )
    """)