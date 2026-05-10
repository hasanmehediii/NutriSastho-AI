from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.database import engine
from backend.model import Base
from backend.model import User  # noqa: F401 ensures model metadata is registered
from backend.router.auth import router as auth_router

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
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(120)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10)"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(120)"))


@app.get("/")
async def root():
    return {"message" : "Server is running"}


# include auth routes
app.include_router(auth_router)

