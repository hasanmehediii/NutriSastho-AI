from backend.model import User
from sqlalchemy.orm import Session
from sqlalchemy import select
import bcrypt


def _hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def _verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


class AuthService:
    def __init__(self, session: Session) -> None:
        self.session = session

    def register_user(self, user: User):
        user.password = _hash_password(user.password)
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        except Exception as e:
            self.session.rollback()
            raise e

    def authenticate_user(self, email: str, password: str):
        stmt = select(User).where(User.email == email)
        result = self.session.execute(stmt).scalars().first()
        if not result:
            return None
        if not _verify_password(password, result.password):
            return None
        return result