from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.uuid_compat import uuid7
from .Base import Base


class BudgetPlan(Base):
    __tablename__ = "budget_plans"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    monthly_budget_bdt: Mapped[int] = mapped_column(Integer, nullable=False)
    family_size: Mapped[int] = mapped_column(Integer, nullable=False)
    meals_per_day: Mapped[int] = mapped_column(Integer, nullable=False)
    market_area: Mapped[str | None] = mapped_column(String(200), nullable=True)
    preferred_foods: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    foods_to_avoid: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    category_breakdown: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weekly_spend: Mapped[list | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
