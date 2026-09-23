from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    id: Optional[str] = None
    product_id: Optional[str] = None
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)
    size: Optional[str] = None
    item_code: Optional[str] = None


class ShippingAddress(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None


class CODOrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: ShippingAddress


class OrderRead(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    payment_method: str
    payment_status: str
    shipping_address: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class OrderItemRead(BaseModel):
    id: str
    order_id: str
    product_id: Optional[str]
    product_name: str
    quantity: int
    price: float
    size: Optional[str]
    item_code: Optional[str]

    class Config:
        orm_mode = True
