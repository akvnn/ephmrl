"""seed permissions data

Revision ID: 05947c6a535e
Revises: 2e84c2936161
Create Date: 2025-11-14 15:12:36.992082

"""
from typing import Sequence, Union
from sqlalchemy.dialects.postgresql import UUID
from uuid import UUID as UUID_TYPE

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '05947c6a535e'
down_revision: Union[str, Sequence[str], None] = '2e84c2936161'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ============= Permission IDs =============
# Organization Management
ORG_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000001')
ORG_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000002')
ORG_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000003')
ORG_BILLING_ID = UUID_TYPE('20000000-0000-0000-0000-000000000004')

# Member Management
MEMBERS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000011')
MEMBERS_INVITE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000012')
MEMBERS_REMOVE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000013')
MEMBERS_ROLES_ID = UUID_TYPE('20000000-0000-0000-0000-000000000014')

# Project Management
PROJECTS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000021')
PROJECTS_CREATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000022')
PROJECTS_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000023')
PROJECTS_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000024')

# Document Management
DOCUMENTS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000031')
DOCUMENTS_CREATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000032')
DOCUMENTS_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000033')
DOCUMENTS_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000034')

# API Access
API_ACCESS_ID = UUID_TYPE('20000000-0000-0000-0000-000000000041')


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
        # Organization Management
        {
            'id': ORG_VIEW_ID,
            'name': 'organization.view',
            'resource': 'organization',
            'action': 'view',
            'description': 'View organization details and settings',
        },
        {
            'id': ORG_UPDATE_ID,
            'name': 'organization.update',
            'resource': 'organization',
            'action': 'update',
            'description': 'Update organization settings',
        },
        {
            'id': ORG_DELETE_ID,
            'name': 'organization.delete',
            'resource': 'organization',
            'action': 'delete',
            'description': 'Delete the organization',
        },
        {
            'id': ORG_BILLING_ID,
            'name': 'organization.billing',
            'resource': 'organization',
            'action': 'billing',
            'description': 'Manage billing and subscriptions',
        },
        
        # Member Management
        {
            'id': MEMBERS_VIEW_ID,
            'name': 'members.view',
            'resource': 'members',
            'action': 'view',
            'description': 'View organization members',
        },
        {
            'id': MEMBERS_INVITE_ID,
            'name': 'members.invite',
            'resource': 'members',
            'action': 'invite',
            'description': 'Invite new members to organization',
        },
        {
            'id': MEMBERS_REMOVE_ID,
            'name': 'members.remove',
            'resource': 'members',
            'action': 'remove',
            'description': 'Remove members from organization',
        },
        {
            'id': MEMBERS_ROLES_ID,
            'name': 'members.manage_roles',
            'resource': 'members',
            'action': 'manage_roles',
            'description': 'Assign and modify member roles',
        },
        
        # Project Management
        {
            'id': PROJECTS_VIEW_ID,
            'name': 'projects.view',
            'resource': 'projects',
            'action': 'view',
            'description': 'View projects',
        },
        {
            'id': PROJECTS_CREATE_ID,
            'name': 'projects.create',
            'resource': 'projects',
            'action': 'create',
            'description': 'Create new projects',
        },
        {
            'id': PROJECTS_UPDATE_ID,
            'name': 'projects.update',
            'resource': 'projects',
            'action': 'update',
            'description': 'Update existing projects',
        },
        {
            'id': PROJECTS_DELETE_ID,
            'name': 'projects.delete',
            'resource': 'projects',
            'action': 'delete',
            'description': 'Delete projects',
        },
        
        # Document Management
        {
            'id': DOCUMENTS_VIEW_ID,
            'name': 'documents.view',
            'resource': 'documents',
            'action': 'view',
            'description': 'View documents',
        },
        {
            'id': DOCUMENTS_CREATE_ID,
            'name': 'documents.create',
            'resource': 'documents',
            'action': 'create',
            'description': 'Create new documents',
        },
        {
            'id': DOCUMENTS_UPDATE_ID,
            'name': 'documents.update',
            'resource': 'documents',
            'action': 'update',
            'description': 'Update existing documents',
        },
        {
            'id': DOCUMENTS_DELETE_ID,
            'name': 'documents.delete',
            'resource': 'documents',
            'action': 'delete',
            'description': 'Delete documents',
        },
        
        # API Access
        {
            'id': API_ACCESS_ID,
            'name': 'api.access',
            'resource': 'api',
            'action': 'access',
            'description': 'Access organization API',
        },
    ])


def downgrade() -> None:
    """Remove seed data for permissions"""
    op.execute("""
        DELETE FROM permissions 
        WHERE id IN (
            '20000000-0000-0000-0000-000000000001',
            '20000000-0000-0000-0000-000000000002',
            '20000000-0000-0000-0000-000000000003',
            '20000000-0000-0000-0000-000000000004',
            '20000000-0000-0000-0000-000000000011',
            '20000000-0000-0000-0000-000000000012',
            '20000000-0000-0000-0000-000000000013',
            '20000000-0000-0000-0000-000000000014',
            '20000000-0000-0000-0000-000000000021',
            '20000000-0000-0000-0000-000000000022',
            '20000000-0000-0000-0000-000000000023',
            '20000000-0000-0000-0000-000000000024',
            '20000000-0000-0000-0000-000000000031',
            '20000000-0000-0000-0000-000000000032',
            '20000000-0000-0000-0000-000000000033',
            '20000000-0000-0000-0000-000000000034',
            '20000000-0000-0000-0000-000000000041'
        )
    """)
