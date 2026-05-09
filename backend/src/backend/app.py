from fastapi import FastAPI

from backend.router.auth import router as auth_router

app = FastAPI()


@app.get("/")
async def root():
    return {"message" : "Server is running"}


# include auth routes
app.include_router(auth_router)

