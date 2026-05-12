from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class User(BaseModel):
    email: EmailStr

class UserCreate(User):
    password: str = Field(min_length=6, max_length=72)
    full_name: str = Field(min_length=1, max_length=120)
    phone: str = Field(min_length=1, max_length=30)
    blood_group: str = Field(min_length=1, max_length=10)
    location: str = Field(min_length=1, max_length=120)


class UserLogin(User):
    password: str = Field(min_length=6, max_length=72)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None
    location: Optional[str] = None


class AuthResponse(BaseModel):
    user: UserOut
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str
