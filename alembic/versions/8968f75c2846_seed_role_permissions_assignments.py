"""seed role permissions assignments

Revision ID: 8968f75c2846
Revises: 05947c6a535e
Create Date: 2025-11-14 15:17:26.359631

"""
from typing import Sequence, Union
from uuid import UUID as UUID_TYPE

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8968f75c2846'
down_revision: Union[str, Sequence[str], None] = '05947c6a535e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ============= Role IDs =============
OWNER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000001')
ADMIN_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000002')
MEMBER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000003')
VIEWER_ROLE_ID = UUID_TYPE('10000000-0000-0000-0000-000000000004')

# ============= Permission IDs =============
# Organization
ORG_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000001')
ORG_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000002')
ORG_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000003')
ORG_BILLING_ID = UUID_TYPE('20000000-0000-0000-0000-000000000004')

# Members
MEMBERS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000011')
MEMBERS_INVITE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000012')
MEMBERS_REMOVE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000013')
MEMBERS_ROLES_ID = UUID_TYPE('20000000-0000-0000-0000-000000000014')

# Projects
PROJECTS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000021')
PROJECTS_CREATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000022')
PROJECTS_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000023')
PROJECTS_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000024')

# Documents
DOCUMENTS_VIEW_ID = UUID_TYPE('20000000-0000-0000-0000-000000000031')
DOCUMENTS_CREATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000032')
DOCUMENTS_UPDATE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000033')
DOCUMENTS_DELETE_ID = UUID_TYPE('20000000-0000-0000-0000-000000000034')

# API
API_ACCESS_ID = UUID_TYPE('20000000-0000-0000-0000-000000000041')


def upgrade() -> None:
    """Assign permissions to roles"""
    
    # ============= OWNER - All Permissions =============
    op.execute(f"""
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES 
            -- Organization
            ('{OWNER_ROLE_ID}', '{ORG_VIEW_ID}'),
            ('{OWNER_ROLE_ID}', '{ORG_UPDATE_ID}'),
            ('{OWNER_ROLE_ID}', '{ORG_DELETE_ID}'),
            ('{OWNER_ROLE_ID}', '{ORG_BILLING_ID}'),
            -- Members
            ('{OWNER_ROLE_ID}', '{MEMBERS_VIEW_ID}'),
            ('{OWNER_ROLE_ID}', '{MEMBERS_INVITE_ID}'),
            ('{OWNER_ROLE_ID}', '{MEMBERS_REMOVE_ID}'),
            ('{OWNER_ROLE_ID}', '{MEMBERS_ROLES_ID}'),
            -- Projects
            ('{OWNER_ROLE_ID}', '{PROJECTS_VIEW_ID}'),
            ('{OWNER_ROLE_ID}', '{PROJECTS_CREATE_ID}'),
            ('{OWNER_ROLE_ID}', '{PROJECTS_UPDATE_ID}'),
            ('{OWNER_ROLE_ID}', '{PROJECTS_DELETE_ID}'),
            -- Documents
            ('{OWNER_ROLE_ID}', '{DOCUMENTS_VIEW_ID}'),
            ('{OWNER_ROLE_ID}', '{DOCUMENTS_CREATE_ID}'),
            ('{OWNER_ROLE_ID}', '{DOCUMENTS_UPDATE_ID}'),
            ('{OWNER_ROLE_ID}', '{DOCUMENTS_DELETE_ID}'),
            -- API
            ('{OWNER_ROLE_ID}', '{API_ACCESS_ID}')
    """)
    
    # ============= ADMIN - All except billing and org delete =============
    op.execute(f"""
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES 
            -- Organization (no billing, no delete)
            ('{ADMIN_ROLE_ID}', '{ORG_VIEW_ID}'),
            ('{ADMIN_ROLE_ID}', '{ORG_UPDATE_ID}'),
            -- Members
            ('{ADMIN_ROLE_ID}', '{MEMBERS_VIEW_ID}'),
            ('{ADMIN_ROLE_ID}', '{MEMBERS_INVITE_ID}'),
            ('{ADMIN_ROLE_ID}', '{MEMBERS_REMOVE_ID}'),
            ('{ADMIN_ROLE_ID}', '{MEMBERS_ROLES_ID}'),
            -- Projects
            ('{ADMIN_ROLE_ID}', '{PROJECTS_VIEW_ID}'),
            ('{ADMIN_ROLE_ID}', '{PROJECTS_CREATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{PROJECTS_UPDATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{PROJECTS_DELETE_ID}'),
            -- Documents
            ('{ADMIN_ROLE_ID}', '{DOCUMENTS_VIEW_ID}'),
            ('{ADMIN_ROLE_ID}', '{DOCUMENTS_CREATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{DOCUMENTS_UPDATE_ID}'),
            ('{ADMIN_ROLE_ID}', '{DOCUMENTS_DELETE_ID}'),
            -- API
            ('{ADMIN_ROLE_ID}', '{API_ACCESS_ID}')
    """)
    
    # ============= MEMBER - Create, Read, Update (no delete, no member management) =============
    op.execute(f"""
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES 
            -- Organization (view only)
            ('{MEMBER_ROLE_ID}', '{ORG_VIEW_ID}'),
            -- Members (view only)
            ('{MEMBER_ROLE_ID}', '{MEMBERS_VIEW_ID}'),
            -- Projects (CRUD except delete)
            ('{MEMBER_ROLE_ID}', '{PROJECTS_VIEW_ID}'),
            ('{MEMBER_ROLE_ID}', '{PROJECTS_CREATE_ID}'),
            ('{MEMBER_ROLE_ID}', '{PROJECTS_UPDATE_ID}'),
            -- Documents (CRUD except delete)
            ('{MEMBER_ROLE_ID}', '{DOCUMENTS_VIEW_ID}'),
            ('{MEMBER_ROLE_ID}', '{DOCUMENTS_CREATE_ID}'),
            ('{MEMBER_ROLE_ID}', '{DOCUMENTS_UPDATE_ID}'),
            -- API
            ('{MEMBER_ROLE_ID}', '{API_ACCESS_ID}')
    """)
    
    # ============= VIEWER - Read Only =============
    op.execute(f"""
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES 
            -- Organization (view only)
            ('{VIEWER_ROLE_ID}', '{ORG_VIEW_ID}'),
            -- Members (view only)
            ('{VIEWER_ROLE_ID}', '{MEMBERS_VIEW_ID}'),
            -- Projects (view only)
            ('{VIEWER_ROLE_ID}', '{PROJECTS_VIEW_ID}'),
            -- Documents (view only)
            ('{VIEWER_ROLE_ID}', '{DOCUMENTS_VIEW_ID}')
    """)


def downgrade() -> None:
    """Remove role-permission assignments"""
    op.execute(f"""
        DELETE FROM role_permissions 
        WHERE role_id IN (
            '{OWNER_ROLE_ID}',
            '{ADMIN_ROLE_ID}',
            '{MEMBER_ROLE_ID}',
            '{VIEWER_ROLE_ID}'
        )
    """)