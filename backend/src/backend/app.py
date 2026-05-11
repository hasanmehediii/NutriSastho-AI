from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database import engine
from backend.model import Base
from backend.model import User  # noqa: F401 ensures model metadata is registered
from backend.model import HealthProfile  # noqa: F401 ensures model metadata is registered
from backend.router.auth import router as auth_router
from backend.router.health_profile import router as health_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://server99bugsincode.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def create_tables() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
async def root():
    return {"message" : "Server is running"}


# include auth routes
app.include_router(auth_router)
# include health routes
app.include_router(health_router)

