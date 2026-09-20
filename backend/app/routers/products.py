from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductRead, ProductUpdate

from app.enums.product_category import ProductCategory


SessionDep = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductRead])
def list_all_products(
    session: SessionDep
) -> list[ProductRead]:
    
    products = session.exec(select(Product)).all()
    return products


@router.post("/", response_model=ProductRead)
def create_product(
    product: ProductCreate,
    session: SessionDep
) -> ProductRead:

    product_db = Product.model_validate(product)

    session.add(product_db)
    session.commit()
    session.refresh(product_db)
    return product_db


@router.get("/{id}", response_model=ProductRead)
def read_product_by_id(
    id: int,
    session: SessionDep
) -> ProductRead:
    
    product = session.get(Product, id)
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    return product


@router.patch("/{id}", response_model=ProductRead)
def update_product_by_id(
    id: int,
    product: ProductUpdate,
    session: SessionDep
) -> ProductRead:

    product_db = session.get(Product, id)
    if not product_db:
        raise HTTPException(status_code=404, detail="product not found")

    update_data = product.model_dump(exclude_unset=True)
    product_db.sqlmodel_update(update_data)

    session.add(product_db)
    session.commit()
    session.refresh(product_db)

    return product_db


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


@router.get("/active/", response_model=list[ProductRead])
def list_active_product(
    session: SessionDep
) -> list[ProductRead]:

    statement = select(Product).where(Product.is_active == True)
    products = session.exec(statement).all()

    if not products:
        raise HTTPException(status_code=404, detail="product not found")
    
    return products