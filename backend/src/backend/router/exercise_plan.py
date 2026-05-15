from fastapi.routing import APIRouter

from backend.controller.exercise_plan import (
    get_my_exercise_plan,
    submit_exercise_plan,
)

router = APIRouter(prefix="/exercise", tags=["exercise"])

# POST /exercise/plan -> save exercise plan
router.post("/plan")(submit_exercise_plan)

# GET /exercise/plan -> get latest exercise plan
router.get("/plan")(get_my_exercise_plan)
