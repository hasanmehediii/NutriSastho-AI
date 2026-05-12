from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.model.BudgetPlan import BudgetPlan
from backend.schema.budget import BudgetPlanCreate

_CATEGORY_WEIGHTS: list[tuple[str, int, str]] = [
    ("Rice & Staples", 1800, "#087f5b"),
    ("Protein (Fish/Egg/Chicken)", 1500, "#6366f1"),
    ("Vegetables", 900, "#22c55e"),
    ("Fruits", 450, "#f59e0b"),
    ("Dairy", 600, "#06b6d4"),
    ("Oil & Spices", 750, "#ef4444"),
]


def _build_category_breakdown(monthly_budget_bdt: int) -> list[dict[str, str | int]]:
    template_total = sum(w for _, w, _ in _CATEGORY_WEIGHTS)
    if template_total <= 0 or monthly_budget_bdt <= 0:
        return []

    raw = [monthly_budget_bdt * w / template_total for _, w, _ in _CATEGORY_WEIGHTS]
    rounded = [int(round(x)) for x in raw]
    drift = monthly_budget_bdt - sum(rounded)
    if drift != 0 and rounded:
        rounded[-1] = max(0, rounded[-1] + drift)

    return [
        {"name": name, "value": value, "color": color}
        for (name, _, color), value in zip(_CATEGORY_WEIGHTS, rounded, strict=True)
    ]


def _build_weekly_spend(monthly_budget_bdt: int) -> list[dict[str, str | int]]:
    if monthly_budget_bdt <= 0:
        return []
    base = monthly_budget_bdt / 4
    factors = (0.98, 0.96, 0.92, 0.86)
    amounts = [max(0, int(round(base * f))) for f in factors]
    drift = monthly_budget_bdt - sum(amounts)
    if drift != 0:
        amounts[-1] = max(0, amounts[-1] + drift)
    return [
        {"week": label, "amount": amt}
        for label, amt in zip(
            ("Week 1", "Week 2", "Week 3", "Week 4"), amounts, strict=True
        )
    ]


class BudgetService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_latest(self, user_id: UUID) -> BudgetPlan | None:
        stmt = (
            select(BudgetPlan)
            .where(BudgetPlan.user_id == user_id)
            .order_by(BudgetPlan.created_at.desc())
            .limit(1)
        )
        return self.session.execute(stmt).scalars().first()

    def create(self, user_id: UUID, data: BudgetPlanCreate) -> BudgetPlan:
        preferred = [s.strip() for s in (data.preferred_foods or []) if s and s.strip()]
        avoid = [s.strip() for s in (data.foods_to_avoid or []) if s and s.strip()]
        breakdown = _build_category_breakdown(data.monthly_budget_bdt)
        weekly = _build_weekly_spend(data.monthly_budget_bdt)

        row = BudgetPlan(
            user_id=user_id,
            monthly_budget_bdt=data.monthly_budget_bdt,
            family_size=data.family_size,
            meals_per_day=data.meals_per_day,
            market_area=data.market_area,
            preferred_foods=preferred,
            foods_to_avoid=avoid,
            category_breakdown=breakdown,
            weekly_spend=weekly,
        )
        self.session.add(row)
        self.session.commit()
        self.session.refresh(row)
        return row
