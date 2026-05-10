from backend.model.HealthProfile import HealthProfile
from backend.schema.health_profile import HealthProfileCreate
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID


class HealthProfileService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def create(self, user_id: UUID, data: HealthProfileCreate) -> HealthProfile:
        # Compute BMI if height and weight are provided
        bmi = None
        if data.height_cm and data.weight_kg and data.height_cm > 0:
            height_m = data.height_cm / 100
            bmi = round(data.weight_kg / (height_m ** 2), 1)

        profile = HealthProfile(
            user_id=user_id,
            age=data.age,
            gender=data.gender,
            height_cm=data.height_cm,
            weight_kg=data.weight_kg,
            bmi=bmi,
            activity_level=data.activity_level,
            pregnancy_status=data.pregnancy_status,
            allergies=data.allergies,
            temperature_f=data.temperature_f,
            bp_systolic=data.bp_systolic,
            bp_diastolic=data.bp_diastolic,
            blood_sugar=data.blood_sugar,
            symptoms=data.symptoms or [],
            conditions=data.conditions or [],
        )

        self.session.add(profile)
        self.session.commit()
        self.session.refresh(profile)
        return profile

    def get_latest(self, user_id: UUID) -> HealthProfile | None:
        stmt = (
            select(HealthProfile)
            .where(HealthProfile.user_id == user_id)
            .order_by(HealthProfile.created_at.desc())
            .limit(1)
        )
        return self.session.execute(stmt).scalars().first()

    def get_history(self, user_id: UUID, limit: int = 50) -> list[HealthProfile]:
        stmt = (
            select(HealthProfile)
            .where(HealthProfile.user_id == user_id)
            .order_by(HealthProfile.created_at.desc())
            .limit(limit)
        )
        return list(self.session.execute(stmt).scalars().all())
