from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class BudgetPlanCreate(BaseModel):
    monthly_budget_bdt: int = Field(..., ge=1, le=50_000_000)
    family_size: int = Field(..., ge=1, le=30)
    meals_per_day: int = Field(..., ge=1, le=6)
    market_area: Optional[str] = Field(None, max_length=200)
    preferred_foods: Optional[list[str]] = None
    foods_to_avoid: Optional[list[str]] = None


class BudgetCategoryOut(BaseModel):
    name: str
    value: int
    color: str


class BudgetWeekOut(BaseModel):
    week: str
    amount: int


class BudgetPlanOut(BaseModel):
    id: str
    user_id: str
    monthly_budget_bdt: int
    family_size: int
    meals_per_day: int
    market_area: Optional[str] = None
    preferred_foods: list[str] = []
    foods_to_avoid: list[str] = []
    category_breakdown: list[BudgetCategoryOut] = []
    weekly_spend: list[BudgetWeekOut] = []
    created_at: datetime
