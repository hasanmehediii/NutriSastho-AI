from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from backend.schema.auth import RefreshTokenRequest, UserCreate, UserLogin
from backend.model.User import User as UserModel
from backend.service.auth import AuthService
from backend.service.token import (
    TokenError,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
    get_access_token_expires_seconds,
    revoke_refresh_token,
)
from backend.database import get_session

bearer_scheme = HTTPBearer(auto_error=False)


def _auth_response(user: UserModel):
    return {
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "phone": user.phone,
            "blood_group": user.blood_group,
        },
        "access_token": create_access_token(str(user.id), user.email),
        "refresh_token": create_refresh_token(str(user.id), user.email),
        "token_type": "bearer",
        "expires_in": get_access_token_expires_seconds(),
    }


def add_user(user: UserCreate, session: Session = Depends(get_session)):
    svc = AuthService(session)
    user_model = UserModel(
        email=user.email,
        password=user.password,
        full_name=user.full_name,
        phone=user.phone,
        blood_group=user.blood_group,
    )
    try:
        created = svc.register_user(user_model)
        return _auth_response(created)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create user",
        ) from e


def login_user(user: UserLogin, session: Session = Depends(get_session)):
    svc = AuthService(session)
    found = svc.authenticate_user(user.email, user.password)
    if not found:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return _auth_response(found)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
):
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    svc = AuthService(session)
    user = svc.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def read_current_user(current_user: UserModel = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "blood_group": current_user.blood_group,
    }


def refresh_access_token(
    body: RefreshTokenRequest,
    session: Session = Depends(get_session),
):
    try:
        payload = decode_refresh_token(body.refresh_token)
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    svc = AuthService(session)
    user = svc.get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return _auth_response(user)


def logout_user(
    body: RefreshTokenRequest,
):
    try:
        revoke_refresh_token(body.refresh_token)
    except TokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        ) from e
    return {"ok": True}
