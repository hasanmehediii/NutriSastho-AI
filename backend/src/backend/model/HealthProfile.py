from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import Numeric, String, Float, Integer, JSON, ForeignKey, DateTime, Computed, cast
from sqlalchemy.sql import func
from uuid import uuid7, UUID
from datetime import datetime
from .Base import Base


class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True, nullable=False)

    # Profile fields
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    bmi: Mapped[float | None] = mapped_column(
        Float, 
        Computed(
            func.round(
                cast(weight_kg / func.pow(height_cm / 100, 2), Numeric), 3
            )
        ),
        nullable=True)
    activity_level: Mapped[str | None] = mapped_column(String(30), nullable=True)
    pregnancy_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    allergies: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Vital signs
    temperature_f: Mapped[float | None] = mapped_column(Float, nullable=True)
    bp_systolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bp_diastolic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    blood_sugar: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Symptoms & conditions (stored as JSON arrays)
    symptoms: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    conditions: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)

    # Timestamp
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
