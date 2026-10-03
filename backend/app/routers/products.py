from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_db
from app.models import Product
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.enums.product_category import ProductCategory
from app.services import product_service


SessionDep = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductRead])
def list_all_products(
    session: SessionDep
) -> list[ProductRead]:

    products = product_service.fetch_all_products(session)

    return products


@router.post("/", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    session: SessionDep
) -> ProductRead:

    product_db = product_service.create_product(session, product)

    return product_db


@router.get("/active/", response_model=list[ProductRead])
def list_active_product(
    session: SessionDep
) -> list[ProductRead]:

    products = product_service.fetch_all_active_products(session)

    if not products:
        raise HTTPException(status_code=404, detail="product not found")

    return products


@router.get("/category/{category}", response_model=list[ProductRead])
def list_product_by_category(
    category: ProductCategory,
    session: SessionDep
) -> list[ProductRead]:

    statement = select(Product).where(Product.category == category)
    products = session.exec(statement).all()

    if not products:
        raise HTTPException(status_code=404, detail="product not found")
    
    return products


@router.get("/{id}", response_model=ProductRead)
def read_product_by_id(
    id: int,
    session: SessionDep
) -> ProductRead:

    product = product_service.fetch_product_by_id(session, id)

    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    return product


@router.patch("/{id}", response_model=ProductRead)
def update_product_by_id(
    id: int,
    product: ProductUpdate,
    session: SessionDep
) -> ProductRead:

    product_db = product_service.update_product(session, id, product)

    if not product_db:
        raise HTTPException(status_code=404, detail="product not found")

    return product_db


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_product(id: int, session: SessionDep):
    success = product_service.deactivate_product(session, id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
