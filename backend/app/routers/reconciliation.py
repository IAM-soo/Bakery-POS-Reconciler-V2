from typing import Annotated
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_db
from app.schemas.reconciliation import ComparisonResult, ReconcileRequest, CombinationResult, CorrectionRequest
from app.services import reconciliation_service, product_service

SessionDep = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/reconciliation", tags=["reconciliation"])


@router.post("/", response_model=list[ComparisonResult])
def reconcile_payments(payload: ReconcileRequest):
    cat_amounts = reconciliation_service.reconcile_cat_amounts(payload.cat_amounts_temp)
    results = reconciliation_service.compare_payment_amounts(payload.pos_amounts, cat_amounts)
    return results


@router.post("/corrections", response_model=list[CombinationResult])
def calculate_correction_combinations(payload: CorrectionRequest, db: SessionDep):
    products = product_service.fetch_all_active_products(db)
    target_amount = reconciliation_service.calculate_target_amount(payload.cancelled_amount, payload.difference, payload.mode)

    if target_amount is None or target_amount <= 0:
        return []
    
    products_as_dicts = [{"id": p.id, "item_name": p.item_name, "price": p.price} for p in products]

    combinations = reconciliation_service.find_combinations(products_as_dicts, target_amount, max_items=8, max_results=3)

    formatted_combinations = reconciliation_service.format_combinations(combinations)

    return formatted_combinations