"""add clinics table

Revision ID: b4d9c2e1a8f0
Revises: d1f85a3133f5
Create Date: 2026-05-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b4d9c2e1a8f0"
down_revision: Union[str, Sequence[str], None] = "d1f85a3133f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clinics",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("hospital_name", sa.String(length=255), nullable=False),
        sa.Column("area", sa.String(length=120), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=False),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_clinics_area"), "clinics", ["area"], unique=False)
    op.create_index(op.f("ix_clinics_city"), "clinics", ["city"], unique=False)
    op.create_index(op.f("ix_clinics_hospital_name"), "clinics", ["hospital_name"], unique=False)
    op.create_index(op.f("ix_clinics_type"), "clinics", ["type"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_clinics_type"), table_name="clinics")
    op.drop_index(op.f("ix_clinics_hospital_name"), table_name="clinics")
    op.drop_index(op.f("ix_clinics_city"), table_name="clinics")
    op.drop_index(op.f("ix_clinics_area"), table_name="clinics")
    op.drop_table("clinics")
