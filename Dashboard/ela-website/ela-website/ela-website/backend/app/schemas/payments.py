from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class RazorpayOrderRequest(BaseModel):
    amount: int = Field(..., gt=0)
    currency: str = "INR"
    receipt: str
    notes: Optional[Dict[str, Any]] = None


class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    items: list = []
    shipping_address: Optional[Dict[str, Any]] = None


class RazorpayWebhookEvent(BaseModel):
    event: str
    payload: Dict[str, Any]
