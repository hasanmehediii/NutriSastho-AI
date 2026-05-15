from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.controller.auth import get_current_user
from backend.database import get_session
from backend.model.User import User as UserModel
from backend.schema.exercise_plan import ExercisePlanCreate
from backend.service.exercise_plan import ExercisePlanService


def _plan_to_dict(plan):
    return {
        "id": str(plan.id),
        "user_id": str(plan.user_id),
        "plan_data": plan.plan_data,
        "risk_level": plan.risk_level,
        "source": plan.source,
        "created_at": plan.created_at.isoformat(),
    }


def get_my_exercise_plan(
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = ExercisePlanService(session)
    plan = svc.get_latest(current_user.id)
    if not plan:
        return None
    return _plan_to_dict(plan)


def submit_exercise_plan(
    data: ExercisePlanCreate,
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = ExercisePlanService(session)
    try:
        plan = svc.create(current_user.id, data)
        return _plan_to_dict(plan)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not save exercise plan",
        ) from e
