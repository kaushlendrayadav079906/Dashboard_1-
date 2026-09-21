import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.services.sap.client import SAPClient, SAPServiceError
from app.services.sap.products import SAPProductMapper
from app.core.config import settings
from app.models import Order, OrderItem, User
from app.schemas.orders import CODOrderCreate, OrderItemRead, OrderRead

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/cod")
def create_cod_order(payload: CODOrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    total_amount = 0.0
    resolved_items = []
    sap_client = SAPClient()
    for item in payload.items:
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail=f"Invalid quantity for {item.name}")
        if not item.item_code:
            raise HTTPException(status_code=400, detail="SAP item code is required")
        try:
            sap_item = sap_client.get_item_by_code(item.item_code)
        except SAPServiceError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        if not sap_item:
            raise HTTPException(status_code=400, detail="SAP product was not found")

        mapped = SAPProductMapper.map_product(
            sap_item,
            price_list=settings.SAP_DEFAULT_PRICE_LIST,
            warehouse_code=settings.SAP_DEFAULT_WAREHOUSE,
        )
        if mapped["stock"] is None:
            raise HTTPException(status_code=409, detail="SAP inventory is unavailable for the configured warehouse")
        if item.quantity > mapped["stock"]:
            raise HTTPException(status_code=409, detail="Requested quantity is unavailable in SAP")
        total_amount += float(mapped["price"]) * int(item.quantity)
        resolved_items.append((item, mapped))

    order = Order(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        total_amount=total_amount,
        status="pending",
        payment_method="cod",
        payment_status="pending",
        shipping_address=payload.shipping_address.dict(exclude_none=True),
    )
    db.add(order)
    db.flush()

    for item, mapped in resolved_items:
        order_item = OrderItem(
            id=str(uuid.uuid4()),
            order_id=order.id,
            product_id=item.product_id,
            product_name=mapped["name"],
            quantity=item.quantity,
            price=mapped["price"],
            size=item.size,
            item_code=item.item_code,
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)

    return {
        "order_id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "total_amount": order.total_amount,
        "message": "COD order created successfully",
    }


@router.get("/me", response_model=list[OrderRead])
def my_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/{order_id}/items", response_model=list[OrderItemRead])
def get_order_items(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
