"""add exercise_plans table

Revision ID: a1b2c3d4e5f6
Revises: f8c1a2b9d4e0
Create Date: 2026-05-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "f8c1a2b9d4e0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "exercise_plans",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("plan_data", sa.JSON(), nullable=False),
        sa.Column("risk_level", sa.String(length=20), nullable=True),
        sa.Column("source", sa.String(length=20), nullable=True),
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
        op.f("ix_exercise_plans_user_id"), "exercise_plans", ["user_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_exercise_plans_user_id"), table_name="exercise_plans")
    op.drop_table("exercise_plans")
