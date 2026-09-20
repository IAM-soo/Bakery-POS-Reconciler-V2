from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import models
from app.config import settings
from app.database import create_db_and_tables
from app.routers import products


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)
app.include_router(products.router)


@app.get("/")
def read_root():
    return {"message": "Bakery POS API is running"}
