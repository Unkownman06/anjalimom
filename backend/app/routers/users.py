from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..auth import current_user
from ..db import get_db
from ..models import User, Enrollment, Course, Order, CourseProgress

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def me(user=Depends(current_user)):
    return {"id": user.id, "name": user.name, "email": user.email, "profile_image": user.profile_image, "role": user.role, "created_at": user.created_at}

@router.get("/dashboard")
def dashboard(user=Depends(current_user), db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user.id, Enrollment.status == "active").all()
    courses = []
    for e in enrollments:
        c = db.query(Course).filter(Course.id == e.course_id).first()
        p = db.query(CourseProgress).filter(CourseProgress.user_id == user.id, CourseProgress.course_id == c.id).first()
        courses.append({"id": c.id, "title": c.title, "slug": c.slug, "image": c.image, "progress": p.progress if p else 0})
    orders = db.query(Order).filter(Order.user_id == user.id).order_by(Order.created_at.desc()).all()
    return {"user": me(user), "courses": courses, "payments": [
        {"id": o.id, "course_id": o.course_id, "amount": float(o.final_amount), "discount": float(o.discount_amount), "status": o.status, "order_id": o.razorpay_order_id, "payment_id": o.razorpay_payment_id, "date": o.created_at}
        for o in orders
    ]}

@router.get("/courses/{course_id}/access")
def course_access(course_id: int, user=Depends(current_user), db: Session = Depends(get_db)):
    e = db.query(Enrollment).filter(Enrollment.user_id == user.id, Enrollment.course_id == course_id, Enrollment.status == "active").first()
    if not e: raise __import__("fastapi").HTTPException(403, "Course purchase required")
    c = db.query(Course).filter(Course.id == course_id).first()
    return {"course_id": course_id, "enrolled": True, "whatsapp_available": bool(c.whatsapp_enabled and c.whatsapp_invite_link), "whatsapp_url": c.whatsapp_invite_link if c.whatsapp_enabled else None}
