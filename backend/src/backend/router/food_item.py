from fastapi.routing import APIRouter
from backend.controller.food_item import get_all_food_items, sync_prices, discover_food

router = APIRouter(prefix="/food", tags=["food"])

# GET /food -> get all food items from MongoDB
router.get("")(get_all_food_items)
router.get("/")(get_all_food_items)

# POST /food/sync-prices -> triggers the background price sync
router.post("/sync-prices")(sync_prices)

# POST /food/discover -> discovers and saves an unknown food via web scraping
router.post("/discover")(discover_food)
