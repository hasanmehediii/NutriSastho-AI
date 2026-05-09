from pydantic import BaseModel
from pydantic import EmailStr

class User(BaseModel):
    email: EmailStr

class UserCreate(User):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr