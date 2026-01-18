"""Merge all heads to single

Revision ID: ab796c72a5ae
Revises: 2f49580e344f, acaa04b6d741
Create Date: 2026-01-18 22:48:37.566489

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ab796c72a5ae'
down_revision = ('2f49580e344f', 'acaa04b6d741')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
