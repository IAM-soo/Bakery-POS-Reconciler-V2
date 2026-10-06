from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from fastapi import FastAPI

from app import models
from app.config import settings
from app.database import create_db_and_tables
from app.routers import products, reconciliation


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://bakery-pos-reconciler-v2.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)


app.include_router(products.router)
app.include_router(reconciliation.router)



@app.get("/")
def read_root():
    return {"message": "Bakery POS API is running"}
