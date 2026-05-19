from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExerciseItem(BaseModel):
    name: str
    duration_min: int
    intensity: str
    target: str
    calories: int


class ExerciseDayPlan(BaseModel):
    key: str
    label: str
    exercises: list[ExerciseItem]
    total_duration_min: int
    total_calories_burned: int
    is_rest_day: bool = False


class WeeklySummary(BaseModel):
    total_sessions: int
    rest_days: int
    total_duration_min: int
    total_calories_burned: int


class ExercisePlanCreate(BaseModel):
    plan_data: dict
    risk_level: Optional[str] = None
    source: Optional[str] = "rules"


class ExercisePlanOut(BaseModel):
    id: str
    user_id: str
    plan_data: dict
    risk_level: Optional[str] = None
    source: Optional[str] = None
    created_at: datetime
