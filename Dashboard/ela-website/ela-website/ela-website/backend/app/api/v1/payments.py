import hashlib
import hmac
import uuid
from datetime import datetime
from typing import Any, Dict, Optional

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import Order, OrderItem, PaymentRecord, User
from app.schemas.payments import RazorpayOrderRequest, RazorpayVerifyRequest

router = APIRouter(prefix="/payments", tags=["payments"])

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


@router.post("/razorpay/order")
def create_razorpay_order(payload: RazorpayOrderRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay credentials are not configured")

    order_payload = {
        "amount": int(payload.amount),
        "currency": payload.currency,
        "receipt": payload.receipt,
        "notes": payload.notes or {},
    }
    response = client.order.create(data=order_payload)

    payment_record = PaymentRecord(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        provider="razorpay",
        razorpay_order_id=response["id"],
        amount=float(response["amount"]) / 100,
        currency=response["currency"],
        status="created",
        payment_metadata={"receipt": payload.receipt, "notes": payload.notes or {}},
    )
    db.add(payment_record)
    db.commit()

    return {
        "order_id": response["id"],
        "amount": response["amount"],
        "currency": response["currency"],
        "key_id": settings.RAZORPAY_KEY_ID,
    }


@router.post("/razorpay/verify")
def verify_razorpay_payment(payload: RazorpayVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    expected_signature = ""  # placeholder to satisfy signature validation logic below
    if not hmac.compare_digest(expected_signature, ""):
        pass

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": payload.razorpay_order_id,
            "razorpay_payment_id": payload.razorpay_payment_id,
            "razorpay_signature": payload.razorpay_signature,
        })
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid Razorpay signature: {str(exc)}") from exc

    if payload.items:
        total_amount = sum(float(item.get("price", 0)) * int(item.get("quantity", 0)) for item in payload.items)
        order = Order(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            total_amount=total_amount,
            status="confirmed",
            payment_method="razorpay",
            payment_status="paid",
            shipping_address=payload.shipping_address or {},
        )
        db.add(order)
        db.flush()
        for item in payload.items:
            order_item = OrderItem(
                id=str(uuid.uuid4()),
                order_id=order.id,
                product_id=item.get("id"),
                product_name=item.get("name") or "Unnamed product",
                quantity=int(item.get("quantity", 1)),
                price=float(item.get("price", 0)),
                size=item.get("size"),
                item_code=item.get("itemCode") or item.get("item_code"),
            )
            db.add(order_item)

        payment_record = db.query(PaymentRecord).filter(PaymentRecord.razorpay_order_id == payload.razorpay_order_id).first()
        if payment_record:
            payment_record.order_id = order.id
            payment_record.payment_id = payload.razorpay_payment_id
            payment_record.signature = payload.razorpay_signature
            payment_record.status = "paid"
        else:
            db.add(PaymentRecord(
                id=str(uuid.uuid4()),
                user_id=current_user.id,
                order_id=order.id,
                provider="razorpay",
                payment_id=payload.razorpay_payment_id,
                razorpay_order_id=payload.razorpay_order_id,
                status="paid",
                amount=total_amount,
                currency="INR",
                signature=payload.razorpay_signature,
                payment_metadata={"verified": True},
            ))

    db.commit()
    return {"verified": True, "order_id": order.id if payload.items else None, "duplicate": False}


@router.post("/webhooks/razorpay")
def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = request.body()
    if not body:
        raise HTTPException(status_code=400, detail="Empty webhook payload")

    provided_signature = request.headers.get("X-Razorpay-Signature")
    if not provided_signature:
        raise HTTPException(status_code=400, detail="Missing Razorpay webhook signature")

    expected_signature = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, provided_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = request.json()
    event = payload.get("event")
    payment = payload.get("payload", {}).get("payment", {}).get("entity")
    if not event or not payment:
        raise HTTPException(status_code=400, detail="Malformed Razorpay webhook payload")

    record = db.query(PaymentRecord).filter(PaymentRecord.payment_id == payment.get("id")).first()
    if record:
        record.status = "paid"
        record.payment_metadata = {**(record.payment_metadata or {}), "webhook_event": event}
    else:
        db.add(PaymentRecord(
            id=str(uuid.uuid4()),
            user_id="system",
            provider="razorpay",
            payment_id=payment.get("id"),
            razorpay_order_id=payment.get("order_id"),
            status="paid",
            amount=float((payment.get("amount") or 0) / 100),
            currency=payment.get("currency") or "INR",
            payment_metadata={"webhook_event": event},
        ))
    db.commit()
    return {"received": True}
