from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class HealthProfileCreate(BaseModel):
    age: Optional[int] = Field(None, ge=0, le=150)
    gender: Optional[str] = Field(None, max_length=20)
    height_cm: Optional[float] = Field(None, gt=0, le=300)
    weight_kg: Optional[float] = Field(None, gt=0, le=500)
    activity_level: Optional[str] = Field(None, max_length=30)
    pregnancy_status: Optional[str] = Field(None, max_length=30)
    allergies: Optional[str] = Field(None, max_length=500)

    # Vital signs
    temperature_f: Optional[float] = Field(None, ge=90.0, le=115.0)
    bp_systolic: Optional[int] = Field(None, ge=50, le=300)
    bp_diastolic: Optional[int] = Field(None, ge=30, le=200)
    blood_sugar: Optional[float] = Field(None, ge=0, le=1000)

    # Symptoms and conditions as lists of strings
    symptoms: Optional[list[str]] = None
    conditions: Optional[list[str]] = None


class HealthProfileOut(BaseModel):
    id: str
    user_id: str
    age: Optional[int] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    bmi: Optional[float] = None
    activity_level: Optional[str] = None
    pregnancy_status: Optional[str] = None
    allergies: Optional[str] = None
    temperature_f: Optional[float] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    blood_sugar: Optional[float] = None
    symptoms: Optional[list[str]] = None
    conditions: Optional[list[str]] = None
    created_at: datetime
