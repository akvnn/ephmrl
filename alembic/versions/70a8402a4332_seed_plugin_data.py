"""Seed Plugin Data

Revision ID: 70a8402a4332
Revises: 978e64eace3f
Create Date: 2025-11-29 16:06:07.103890

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '70a8402a4332'
down_revision: Union[str, Sequence[str], None] = '978e64eace3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Seed plugins table with initial plugin data."""
    op.execute(
        """
        INSERT INTO plugins (id, slug)
        VALUES (gen_random_uuid(), 'document-intelligence')
        """
    )


def downgrade() -> None:
    """Remove seeded plugin data."""
    op.execute(
        """
        DELETE FROM plugins WHERE slug = 'document-intelligence';
        """
    )
