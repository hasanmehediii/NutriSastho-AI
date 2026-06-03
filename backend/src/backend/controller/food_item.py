from fastapi import Depends
from backend.database import get_mongo_db
from backend.service.food_item import FoodItemService


def get_all_food_items(mongo=Depends(get_mongo_db)):
    svc = FoodItemService(mongo)
    return svc.get_all()


async def sync_prices(mongo=Depends(get_mongo_db)):
    svc = FoodItemService(mongo)
    return await svc.sync_realtime_prices()


async def discover_food(food_name: str, mongo=Depends(get_mongo_db)):
    svc = FoodItemService(mongo)
    return await svc.discover_food(food_name)
