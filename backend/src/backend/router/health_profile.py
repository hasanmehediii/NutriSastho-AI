from fastapi.routing import APIRouter

from backend.controller.health_profile import (
    submit_health_profile,
    get_my_health_profile,
    get_my_health_history,
    get_health_profile_by_user_id,
)
from backend.schema.health_profile import HealthProfileOut

router = APIRouter(prefix="/health", tags=["health"])

# POST /health/profile -> submit health data
router.post("/profile")(submit_health_profile)

# GET /health/profile -> get latest health profile
router.get("/profile")(get_my_health_profile)

# GET /health/history -> get health profile history
router.get("/history")(get_my_health_history)

# GET /health/user/{user_id} -> internal route for MCP server
router.get("/user/{user_id}")(get_health_profile_by_user_id)
