from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from backend.config import get_int_env
from backend.model.BudgetPlan import BudgetPlan
from backend.model.ExercisePlan import ExercisePlan
from backend.model.HealthProfile import HealthProfile


@dataclass(frozen=True)
class RetentionTarget:
    name: str
    model: Any
    days_env: str
    default_days: int


RETENTION_TARGETS = [
    RetentionTarget(
        name="exercise_plans",
        model=ExercisePlan,
        days_env="RETENTION_EXERCISE_PLANS_DAYS",
        default_days=30,
    ),
    RetentionTarget(
        name="budget_plans",
        model=BudgetPlan,
        days_env="RETENTION_BUDGET_PLANS_DAYS",
        default_days=180,
    ),
    RetentionTarget(
        name="health_profiles",
        model=HealthProfile,
        days_env="RETENTION_HEALTH_PROFILES_DAYS",
        default_days=365,
    ),
]


def _get_latest_ids_per_user(session: Session, model: Any) -> set[Any]:
    rows = session.execute(
        select(model.user_id, model.id)
        .order_by(model.user_id, model.created_at.desc(), model.id.desc())
    ).all()

    latest_ids: set[Any] = set()
    seen_users: set[Any] = set()
    for user_id, row_id in rows:
        if user_id in seen_users:
            continue
        seen_users.add(user_id)
        latest_ids.add(row_id)
    return latest_ids


def cleanup_retained_data(
    session: Session,
    *,
    dry_run: bool = True,
    keep_latest_per_user: bool = True,
) -> dict[str, dict[str, Any]]:
    now = datetime.now(UTC)
    summary: dict[str, dict[str, Any]] = {}

    for target in RETENTION_TARGETS:
        retention_days = get_int_env(target.days_env, target.default_days, minimum=1)
        cutoff = now - timedelta(days=retention_days)

        stmt = select(target.model.id).where(target.model.created_at < cutoff)
        if keep_latest_per_user:
            latest_ids = _get_latest_ids_per_user(session, target.model)
            if latest_ids:
                stmt = stmt.where(target.model.id.not_in(latest_ids))

        ids_to_delete = list(session.execute(stmt).scalars().all())
        deleted_count = 0
        if ids_to_delete and not dry_run:
            result = session.execute(
                delete(target.model).where(target.model.id.in_(ids_to_delete))
            )
            deleted_count = result.rowcount or 0

        summary[target.name] = {
            "retention_days": retention_days,
            "cutoff": cutoff.isoformat(),
            "matched": len(ids_to_delete),
            "deleted": deleted_count,
            "dry_run": dry_run,
            "keep_latest_per_user": keep_latest_per_user,
        }

    if dry_run:
        session.rollback()
    else:
        session.commit()

    return summary
