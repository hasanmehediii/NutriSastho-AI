from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy import String, Float, Integer, JSON
from uuid import UUID
from backend.uuid_compat import uuid7
from .Base import Base

class FoodItem(Base):
    __tablename__ = "food_items"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid7)
    
    name_en: Mapped[str] = mapped_column(String(255), nullable=False)
    name_bn: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    serving: Mapped[str] = mapped_column(String(100), nullable=False)
    
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False)
    fiber_g: Mapped[float] = mapped_column(Float, nullable=False)
    
    price_bdt: Mapped[str] = mapped_column(String(50), nullable=False)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
