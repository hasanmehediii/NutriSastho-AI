from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.schema.user_profile import UserProfileUpdate
from backend.controller.auth import get_current_user
from backend.model.User import User as UserModel
from backend.database import get_session


def update_my_profile(
    data: UserProfileUpdate,
    current_user: UserModel = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    try:
        if data.full_name is not None:
            current_user.full_name = data.full_name
        if data.phone is not None:
            current_user.phone = data.phone
        if data.blood_group is not None:
            current_user.blood_group = data.blood_group
        if data.location is not None:
            current_user.location = data.location

        session.add(current_user)
        session.commit()
        session.refresh(current_user)

        return {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "blood_group": current_user.blood_group,
            "location": current_user.location,
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not update profile",
        ) from e
