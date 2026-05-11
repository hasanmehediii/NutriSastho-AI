from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.schema.health_profile import HealthProfileCreate
from backend.service.health_profile import HealthProfileService
from backend.controller.auth import get_current_user
from backend.model.User import User as UserModel
from backend.database import get_session


def _profile_to_dict(profile):
    return {
        "id": str(profile.id),
        "user_id": str(profile.user_id),
        "age": profile.age,
        "gender": profile.gender,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "bmi": profile.bmi,
        "activity_level": profile.activity_level,
        "pregnancy_status": profile.pregnancy_status,
        "allergies": profile.allergies,
        "temperature_f": profile.temperature_f,
        "bp_systolic": profile.bp_systolic,
        "bp_diastolic": profile.bp_diastolic,
        "blood_sugar": profile.blood_sugar,
        "symptoms": profile.symptoms,
        "conditions": profile.conditions,
        "created_at": profile.created_at.isoformat(),
    }


def submit_health_profile(
    data: HealthProfileCreate,
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = HealthProfileService(session)
    try:
        profile = svc.create(current_user.id, data)
        return _profile_to_dict(profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not save health profile",
        ) from e


def get_my_health_profile(
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = HealthProfileService(session)
    profile = svc.get_latest(current_user.id)
    if not profile:
        return None
    return _profile_to_dict(profile)


def get_my_health_history(
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    svc = HealthProfileService(session)
    profiles = svc.get_history(current_user.id)
    return [_profile_to_dict(p) for p in profiles]
