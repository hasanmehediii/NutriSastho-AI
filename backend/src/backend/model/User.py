from sqlalchemy.orm import  mapped_column, Mapped
from sqlalchemy import String, UUID as SQLAlchemyUUID
from uuid import UUID, uuid7
from .Base import Base


class User(Base):
    __tablename__ = "users"
    
    id: Mapped[UUID] = mapped_column(SQLAlchemyUUID, primary_key=True, default=uuid7)
    email: Mapped[str] = mapped_column(String,index=True, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String,nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True, default=None)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True, default=None)
    blood_group: Mapped[str | None] = mapped_column(String(10), nullable=True, default=None)
