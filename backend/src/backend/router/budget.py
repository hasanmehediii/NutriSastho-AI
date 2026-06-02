from fastapi.routing import APIRouter

from backend.controller.budget import get_my_latest_budget, submit_budget_plan, get_budget_by_user_id

router = APIRouter(prefix="/budget", tags=["budget"])

router.get("/latest")(get_my_latest_budget)
router.post("/")(submit_budget_plan)
router.get("/user/{user_id}")(get_budget_by_user_id)
