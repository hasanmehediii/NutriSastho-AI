from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.model.ExercisePlan import ExercisePlan
from backend.schema.exercise_plan import ExercisePlanCreate


class ExercisePlanService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def get_latest(self, user_id: UUID) -> ExercisePlan | None:
        stmt = (
            select(ExercisePlan)
            .where(ExercisePlan.user_id == user_id)
            .order_by(ExercisePlan.created_at.desc())
            .limit(1)
        )
        return self.session.execute(stmt).scalars().first()

    def create(self, user_id: UUID, data: ExercisePlanCreate) -> ExercisePlan:
        latest = self.get_latest(user_id)
        if (
            latest
            and latest.plan_data == data.plan_data
            and latest.risk_level == data.risk_level
            and latest.source == data.source
        ):
            return latest

        row = ExercisePlan(
            user_id=user_id,
            plan_data=data.plan_data,
            risk_level=data.risk_level,
            source=data.source,
        )
        self.session.add(row)
        self.session.commit()
        self.session.refresh(row)
        return row
