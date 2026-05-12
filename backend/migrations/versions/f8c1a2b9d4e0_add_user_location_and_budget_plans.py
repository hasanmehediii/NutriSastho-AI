"""add user location and budget_plans table

Revision ID: f8c1a2b9d4e0
Revises: 56622456a6dd
Create Date: 2026-05-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8c1a2b9d4e0"
down_revision: Union[str, Sequence[str], None] = "56622456a6dd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("location", sa.String(length=120), nullable=True))
    op.create_table(
        "budget_plans",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("monthly_budget_bdt", sa.Integer(), nullable=False),
        sa.Column("family_size", sa.Integer(), nullable=False),
        sa.Column("meals_per_day", sa.Integer(), nullable=False),
        sa.Column("market_area", sa.String(length=200), nullable=True),
        sa.Column("preferred_foods", sa.JSON(), nullable=True),
        sa.Column("foods_to_avoid", sa.JSON(), nullable=True),
        sa.Column("category_breakdown", sa.JSON(), nullable=True),
        sa.Column("weekly_spend", sa.JSON(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_budget_plans_user_id"), "budget_plans", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_budget_plans_user_id"), table_name="budget_plans")
    op.drop_table("budget_plans")
    op.drop_column("users", "location")
