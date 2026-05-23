from fastapi import Depends
from sqlalchemy.orm import Session
from backend.database import get_session
from backend.service.food_item import FoodItemService

def _food_item_to_dict(food):
    return {
        "id": str(food.id),
        "name_en": food.name_en,
        "name_bn": food.name_bn,
        "category": food.category,
        "serving": food.serving,
        "calories": food.calories,
        "protein_g": food.protein_g,
        "carbs_g": food.carbs_g,
        "fat_g": food.fat_g,
        "fiber_g": food.fiber_g,
        "price_bdt": food.price_bdt,
        "tags": food.tags,
    }

def get_all_food_items(session: Session = Depends(get_session)):
    svc = FoodItemService(session)
    items = svc.get_all()
    return [_food_item_to_dict(i) for i in items]

async def sync_prices(session: Session = Depends(get_session)):
    svc = FoodItemService(session)
    result = await svc.sync_realtime_prices()
    return result
