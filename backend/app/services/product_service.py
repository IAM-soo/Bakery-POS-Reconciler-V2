from sqlmodel import Session, select

from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.models import Product


def fetch_all_active_products(db: Session) -> list[ProductRead]:
    statement = select(Product).where(Product.is_active == True)

    return db.exec(statement).all()


def fetch_product_by_id(db: Session, id: int) -> ProductRead:
    return db.get(Product, id)


def fetch_all_products(db: Session) -> list[ProductRead]:
    
    return db.exec(select(Product)).all()


def update_product(db: Session, id: int, product: ProductUpdate) -> ProductRead:
    product_db = db.get(Product, id)
    if not product_db:
        return None
    update_data = product.model_dump(exclude_unset=True)
    product_db.sqlmodel_update(update_data)

    db.add(product_db)
    db.commit()
    db.refresh(product_db)

    return product_db


def create_product(db: Session, product: ProductCreate) -> ProductRead:

    product_db = Product.model_validate(product)
    
    db.add(product_db)
    db.commit()
    db.refresh(product_db)

    return product_db


def deactivate_product(db: Session, id: int) -> bool:
    product = fetch_product_by_id(db, id)
    
    if not product:
        return False
    
    product.is_active = False
    db.commit()

    return True