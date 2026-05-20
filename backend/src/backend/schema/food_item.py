from pydantic import BaseModel
from typing import List

class FoodItemBase(BaseModel):
    name_en: str
    name_bn: str
    category: str
    serving: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    price_bdt: str
    tags: List[str]

class FoodItemCreate(FoodItemBase):
    pass

class FoodItemOut(FoodItemBase):
    id: str
