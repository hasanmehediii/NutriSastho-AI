import json
from uuid import UUID
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.encoders import jsonable_encoder
from pydantic.json import pydantic_encoder

from backend.router.auth import router as auth_router
from backend.router.health_profile import router as health_router
from backend.router.budget import router as budget_router
from backend.router.exercise_plan import router as exercise_router
from backend.router.food_item import router as food_router
from backend.router.clinics import router as clinics_router


def custom_encoder(obj):
    if isinstance(obj, UUID):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return pydantic_encoder(obj)


app = FastAPI(json_encoders={UUID: str, datetime: lambda v: v.isoformat()})
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


@app.get("/")
async def root():
    return {"message" : "Server is running"}


# include auth routes
app.include_router(auth_router)
# include health routes
app.include_router(health_router)
app.include_router(budget_router)
app.include_router(exercise_router)
app.include_router(food_router)
app.include_router(clinics_router)


