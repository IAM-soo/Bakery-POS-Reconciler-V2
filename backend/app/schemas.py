from pydantic import BaseModel
from app.enums.product_category import ProductCategory

class ProductBase(BaseModel):
    item_name: str
    price: int
    category: ProductCategory
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: int

class ProductUpdate(BaseModel):
    item_name: str | None = None
    price: int | None = None
    category: ProductCategory | None = None
    is_active: bool | None = None
