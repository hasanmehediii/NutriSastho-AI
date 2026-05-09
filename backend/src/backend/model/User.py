from sqlalchemy.orm import  mapped_column, Mapped
from sqlalchemy import String
from uuid import uuid7, UUID
from .Base import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(index=True, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
