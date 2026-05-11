from fastapi.routing import APIRouter

from backend.controller.health_profile import (
    submit_health_profile,
    get_my_health_profile,
    get_my_health_history,
)
from backend.schema.health_profile import HealthProfileOut

router = APIRouter(prefix="/health", tags=["health"])

# POST /health/profile -> submit health data
router.post("/profile")(submit_health_profile)

# GET /health/profile -> get latest health profile
router.get("/profile")(get_my_health_profile)

# GET /health/history -> get health profile history
router.get("/history")(get_my_health_history)
