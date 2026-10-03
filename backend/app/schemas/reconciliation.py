from pydantic import BaseModel

from app.enums.payment_method import ReconciliationMode


class ReconcileRequest(BaseModel):
    pos_amounts: dict[str, int]
    cat_amounts_temp: dict[str, int]


class ComparisonResult(BaseModel):
    method: str
    pos_amount: int
    cat_amount: int
    difference: int
    mode: ReconciliationMode


class CorrectionRequest(BaseModel):
    cancelled_amount: int
    difference: int
    mode: ReconciliationMode


class CombinationItem(BaseModel):
    item_name: str
    price: int
    quantity: int


class CombinationResult(BaseModel):
    combination_number: int
    items: list[CombinationItem]
    total: int

