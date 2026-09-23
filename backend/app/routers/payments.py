from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Course, Order, Enrollment, CourseProgress
from ..auth import current_user
from ..services import pricing
from ..config import settings
import razorpay
import hmac
import hashlib
import re

router = APIRouter(prefix="/api/payments", tags=["payments"])


def client():
    if not settings.razorpay_key_id or not settings.razorpay_key_secret:
        raise HTTPException(503, "Razorpay is not configured")
    return razorpay.Client(auth=(settings.razorpay_key_id, settings.razorpay_key_secret))


def validate_phone(phone: str) -> str:
    phone = (phone or "").strip()
    if not re.fullmatch(r"[6-9][0-9]{9}", phone):
        raise HTTPException(400, "Enter a valid 10-digit Indian mobile number")
    return phone


@router.post("/create-order/{course_id}")
def create_order(course_id: int, payload: dict, user=Depends(current_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.status == "published").first()
    if not course:
        raise HTTPException(404, "Course not found")

    if db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == course.id,
        Enrollment.status == "active"
    ).first():
        raise HTTPException(409, "Already enrolled")

    phone_number = validate_phone(payload.get("phone_number", ""))
    p = pricing(db, course)
    amount_paise = int(round(p["final_price"] * 100))

    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"course_{course.id}_user_{user.id}",
        "notes": {
            "course_id": str(course.id),
            "user_id": str(user.id),
            "phone_number": phone_number,
        },
    }

    r_order = client().order.create(data=order_data)
    order = Order(
        user_id=user.id,
        course_id=course.id,
        phone_number=phone_number,
        original_amount=p["selling_price"],
        discount_amount=p["discount_amount"],
        final_amount=p["final_price"],
        razorpay_order_id=r_order["id"],
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return {
        "order_id": r_order["id"],
        "amount": amount_paise,
        "currency": "INR",
        "key_id": settings.razorpay_key_id,
        "course_id": course.id,
    }


@router.post("/verify")
def verify_payment(payload: dict, user=Depends(current_user), db: Session = Depends(get_db)):
    order_id = payload.get("razorpay_order_id")
    payment_id = payload.get("razorpay_payment_id")
    signature = payload.get("razorpay_signature")
    if not all([order_id, payment_id, signature]):
        raise HTTPException(400, "Incomplete payment data")

    body = f"{order_id}|{payment_id}"
    expected = hmac.new(settings.razorpay_key_secret.encode(), body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(400, "Payment signature verification failed")

    order = db.query(Order).filter(
        Order.razorpay_order_id == order_id,
        Order.user_id == user.id
    ).first()
    if not order:
        raise HTTPException(404, "Order not found")

    order.status = "paid"
    order.razorpay_payment_id = payment_id

    if not db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.course_id == order.course_id
    ).first():
        db.add(Enrollment(user_id=user.id, course_id=order.course_id, status="active"))
        db.add(CourseProgress(user_id=user.id, course_id=order.course_id, progress=0, completed_lessons=0))

    db.commit()
    return {"message": "Payment verified and course access granted"}


@router.post("/webhook")
async def webhook(request: Request, db: Session = Depends(get_db)):
    raw = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    if not settings.razorpay_webhook_secret:
        raise HTTPException(503, "Webhook secret is not configured")

    expected = hmac.new(settings.razorpay_webhook_secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(400, "Invalid webhook signature")

    data = await request.json()
    event = data.get("event", "")
    entity = data.get("payload", {}).get("payment", {}).get("entity", {})

    if event == "payment.captured" and entity.get("order_id"):
        order = db.query(Order).filter(Order.razorpay_order_id == entity["order_id"]).first()
        if order:
            order.status = "paid"
            order.razorpay_payment_id = entity.get("id")
            if not db.query(Enrollment).filter(
                Enrollment.user_id == order.user_id,
                Enrollment.course_id == order.course_id
            ).first():
                db.add(Enrollment(user_id=order.user_id, course_id=order.course_id, status="active"))
            db.commit()

    return {"ok": True}
