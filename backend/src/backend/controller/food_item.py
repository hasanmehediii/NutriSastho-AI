from fastapi import Depends, Body
from backend.database import get_mongo_db
from backend.service.food_item import FoodItemService
from typing import Optional


def get_all_food_items(mongo=Depends(get_mongo_db)):
    svc = FoodItemService(mongo)
    return svc.get_all()


async def sync_prices(mongo=Depends(get_mongo_db), items: Optional[list[str]] = Body(default=None, embed=True)):
    svc = FoodItemService(mongo)
    return await svc.sync_realtime_prices(target_items=items or [])


async def discover_food(food_name: str, mongo=Depends(get_mongo_db)):
    svc = FoodItemService(mongo)
    return await svc.discover_food(food_name)
