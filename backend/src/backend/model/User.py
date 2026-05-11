from sqlalchemy.orm import  mapped_column, Mapped
from sqlalchemy import String
from uuid import UUID

try:
    from uuid import uuid7
except ImportError:
    from uuid import uuid4 as uuid7

from .Base import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(index=True, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True, default=None)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True, default=None)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True, default=None)
