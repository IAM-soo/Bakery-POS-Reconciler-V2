from sqlmodel import Field, SQLModel
from app.enums.product_category import ProductCategory

class Product(SQLModel, table=True):
    __tablename__ = "products"
    
    id: int | None = Field(default=None, primary_key=True)
    item_name: str = Field(max_length=100)
    price: int = Field(ge=0)
    category: ProductCategory
    is_active: bool | None = Field(default=True)


    
