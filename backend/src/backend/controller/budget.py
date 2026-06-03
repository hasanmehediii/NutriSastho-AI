from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.controller.auth import get_current_user
from backend.database import get_session
from backend.model.User import User as UserModel
from backend.schema.budget import BudgetPlanCreate
from backend.service.budget import BudgetService


def _plan_to_dict(plan):
    return {
        "id": str(plan.id),
        "user_id": str(plan.user_id),
        "monthly_budget_bdt": plan.monthly_budget_bdt,
        "family_size": plan.family_size,
        "meals_per_day": plan.meals_per_day,
        "market_area": plan.market_area,
        "preferred_foods": plan.preferred_foods or [],
        "foods_to_avoid": plan.foods_to_avoid or [],
        "category_breakdown": plan.category_breakdown or [],
        "weekly_spend": plan.weekly_spend or [],
        "created_at": plan.created_at.isoformat(),
    }


def get_my_latest_budget(
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = BudgetService(session)
    plan = svc.get_latest(current_user.id)
    if not plan:
        return None
    return _plan_to_dict(plan)


def get_budget_by_user_id(
    user_id: str,
    session: Session = Depends(get_session),
):
    svc = BudgetService(session)
    plan = svc.get_latest(user_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Not found")
    return _plan_to_dict(plan)


def submit_budget_plan(
    data: BudgetPlanCreate,
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = BudgetService(session)
    try:
        plan = svc.create(current_user.id, data)
        return _plan_to_dict(plan)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not save budget plan",
        ) from e
