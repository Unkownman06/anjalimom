from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from .models import Course, Discount

def active_discount(db: Session, course: Course):
    now = datetime.utcnow()
    return db.query(Discount).filter(
        Discount.course_id == course.id,
        Discount.status == "active",
        Discount.start_date <= now,
        Discount.end_date >= now,
    ).order_by(Discount.id.desc()).first()

def pricing(db: Session, course: Course):
    original = Decimal(course.original_price)
    base = Decimal(course.selling_price)
    discount = active_discount(db, course)
    discount_amount = Decimal("0")
    if discount:
        if discount.kind == "percent":
            discount_amount = (base * Decimal(discount.value) / Decimal("100"))
        else:
            discount_amount = Decimal(discount.value)
        discount_amount = min(discount_amount, base)
    final = (base - discount_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return {
        "original_price": float(original),
        "selling_price": float(base),
        "discount_amount": float(discount_amount),
        "final_price": float(final),
        "discount_percent": round(float(discount_amount / base * 100), 2) if base else 0,
        "discount_active": bool(discount),
    }
