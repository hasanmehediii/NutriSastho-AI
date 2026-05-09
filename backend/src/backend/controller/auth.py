from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.schema.auth import UserCreate, UserLogin
from backend.model.User import User as UserModel
from backend.service.auth import AuthService
from backend.database import get_session


def add_user(user: UserCreate, session: Session = Depends(get_session)):
    svc = AuthService(session)
    user_model = UserModel(email=user.email, password=user.password)
    try:
        created = svc.register_user(user_model)
        return {"id": str(created.id), "email": created.email}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


def login_user(user: UserLogin, session: Session = Depends(get_session)):
    svc = AuthService(session)
    found = svc.authenticate_user(user.email, user.password)
    if not found:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"id": str(found.id), "email": found.email}
