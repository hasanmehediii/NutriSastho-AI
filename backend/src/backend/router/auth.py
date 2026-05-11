from fastapi.routing import APIRouter

from backend.controller.auth import (
    add_user,
    login_user,
    logout_user,
    read_current_user,
    refresh_access_token,
)
from backend.controller.user_profile import update_my_profile
from backend.schema.auth import AuthResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


# POST /auth/register -> add_user controller
router.post("/register", response_model=AuthResponse)(add_user)

# POST /auth/login -> login_user controller
router.post("/login", response_model=AuthResponse)(login_user)

# GET /auth/me -> current authenticated user
router.get("/me", response_model=UserOut)(read_current_user)

# PUT /auth/profile -> update user profile fields
router.put("/profile", response_model=UserOut)(update_my_profile)

# POST /auth/refresh -> rotate tokens from refresh token
router.post("/refresh", response_model=AuthResponse)(refresh_access_token)

# POST /auth/logout -> revoke refresh token
router.post("/logout")(logout_user)

