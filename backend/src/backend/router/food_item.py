from fastapi.routing import APIRouter
from backend.controller.food_item import get_all_food_items

router = APIRouter(prefix="/food", tags=["food"])

# GET /food -> get all food items (auto-seeds if empty)
router.get("")(get_all_food_items)
router.get("/")(get_all_food_items)
