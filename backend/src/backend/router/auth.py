from fastapi.routing import APIRouter

from backend.controller.auth import add_user, login_user
from backend.schema.auth import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


# POST /auth/register -> add_user controller
router.post("/register", response_model=UserOut)(add_user)

# POST /auth/login -> login_user controller
router.post("/login", response_model=UserOut)(login_user)

