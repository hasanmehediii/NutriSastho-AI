from backend.model import User
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from uuid import UUID
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
        existing_user = self.get_user_by_email(user.email)
        if existing_user:
            raise ValueError("Email is already registered")

        user.password = _hash_password(user.password)
        try:
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
            return user
        except IntegrityError as e:
            self.session.rollback()
            raise ValueError("Email is already registered") from e
        except Exception as e:
            self.session.rollback()
            raise e

    def get_user_by_email(self, email: str):
        stmt = select(User).where(User.email == email)
        return self.session.execute(stmt).scalars().first()

    def get_user_by_id(self, user_id: str):
        try:
            parsed_user_id = UUID(user_id)
        except ValueError:
            return None

        stmt = select(User).where(User.id == parsed_user_id)
        return self.session.execute(stmt).scalars().first()

    def authenticate_user(self, email: str, password: str):
        result = self.get_user_by_email(email)
        if not result:
            return None
        if not _verify_password(password, result.password):
            return None
        return result