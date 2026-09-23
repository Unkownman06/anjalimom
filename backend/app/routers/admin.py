from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..auth import admin_user
from ..db import get_db
from ..models import (
    User,
    Course,
    CourseService,
    CourseBenefit,
    CurriculumItem,
    Discount,
    Order,
    Enrollment,
    Review,
)
from ..schemas import CourseIn, DiscountIn

router = APIRouter(prefix="/api/admin", tags=["admin"])


def course_out(c):
    return {
        "id": c.id,
        "title": c.title,
        "slug": c.slug,
        "image": c.image,
        "short_description": c.short_description,
        "description": c.description,
        "category": c.category,
        "difficulty": c.difficulty,
        "duration": c.duration,
        "sessions": c.sessions,
        "instructor": c.instructor,
        "original_price": float(c.original_price),
        "selling_price": float(c.selling_price),
        "status": c.status,
        "whatsapp_invite_link": c.whatsapp_invite_link,
        "whatsapp_enabled": c.whatsapp_enabled,
        "whatsapp_configured": bool(c.whatsapp_invite_link),
        "services": [
            {"name": x.name, "description": x.description}
            for x in c.services
        ],
        "benefits": [x.text for x in c.benefits],
        "curriculum": [
            {
                "title": x.title,
                "duration": x.duration,
                "position": x.position,
            }
            for x in sorted(c.curriculum, key=lambda item: item.position)
        ],
    }


@router.get("/summary")
def summary(admin=Depends(admin_user), db: Session = Depends(get_db)):
    total_revenue = sum(
        float(x.final_amount)
        for x in db.query(Order).filter(Order.status == "paid").all()
    )
    return {
        "members": db.query(User).filter(User.role == "member").count(),
        "courses": db.query(Course).count(),
        "purchases": db.query(Order).filter(Order.status == "paid").count(),
        "revenue": total_revenue,
        "subscriptions": db.query(Enrollment).filter(Enrollment.status == "active").count(),
        "reviews": db.query(Review).filter(Review.status == "approved").count(),
        "average_rating": float(
            db.query(func.avg(Review.rating))
            .filter(Review.status == "approved")
            .scalar()
            or 0
        ),
    }


@router.get("/courses")
def courses(admin=Depends(admin_user), db: Session = Depends(get_db)):
    return [
        course_out(c)
        for c in db.query(Course).order_by(Course.created_at.desc()).all()
    ]


@router.get("/courses/{course_id}")
def get_course(course_id: int, admin=Depends(admin_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")
    return course_out(course)


@router.post("/courses")
def create_course(payload: CourseIn, admin=Depends(admin_user), db: Session = Depends(get_db)):
    if db.query(Course).filter(Course.slug == payload.slug).first():
        raise HTTPException(409, "Slug already exists")

    data = payload.model_dump(exclude={"services", "benefits", "curriculum"})
    course = Course(**data)
    db.add(course)
    db.flush()

    for item in payload.services:
        db.add(CourseService(course_id=course.id, **item.model_dump()))
    for item in payload.benefits:
        db.add(CourseBenefit(course_id=course.id, text=item))
    for item in payload.curriculum:
        db.add(CurriculumItem(course_id=course.id, **item.model_dump()))

    db.commit()
    db.refresh(course)
    return course_out(course)


@router.put("/courses/{course_id}")
def update_course(course_id: int, payload: CourseIn, admin=Depends(admin_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    slug_owner = (
        db.query(Course)
        .filter(Course.slug == payload.slug, Course.id != course_id)
        .first()
    )
    if slug_owner:
        raise HTTPException(409, "Another course already uses this slug")

    data = payload.model_dump(exclude={"services", "benefits", "curriculum"})
    for key, value in data.items():
        setattr(course, key, value)

    # Replace the editable child collections. delete-orphan is configured
    # on these relationships, so removed rows are deleted from the database.
    course.services.clear()
    course.benefits.clear()
    course.curriculum.clear()

    for item in payload.services:
        course.services.append(CourseService(**item.model_dump()))
    for item in payload.benefits:
        course.benefits.append(CourseBenefit(text=item))
    for item in payload.curriculum:
        course.curriculum.append(CurriculumItem(**item.model_dump()))

    db.commit()
    db.refresh(course)
    return course_out(course)


@router.delete("/courses/{course_id}")
def delete_course(course_id: int, admin=Depends(admin_user), db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(404, "Course not found")

    purchase_count = db.query(Order).filter(Order.course_id == course_id).count()
    if purchase_count:
        raise HTTPException(
            409,
            "This course has purchase records. Change its status to Draft instead of deleting it."
        )

    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}


@router.post("/courses/{course_id}/discount")
def add_discount(course_id: int, payload: DiscountIn, admin=Depends(admin_user), db: Session = Depends(get_db)):
    if not db.query(Course).filter(Course.id == course_id).first():
        raise HTTPException(404, "Course not found")
    discount = Discount(course_id=course_id, **payload.model_dump())
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return {"message": "Discount added", "id": discount.id}


@router.get("/orders")
def orders(admin=Depends(admin_user), db: Session = Depends(get_db)):
    rows = db.query(Order).order_by(Order.created_at.desc()).limit(200).all()
    result = []

    for order in rows:
        user = db.query(User).filter(User.id == order.user_id).first()
        course = db.query(Course).filter(Course.id == order.course_id).first()
        result.append({
            "id": order.id,
            "user_id": order.user_id,
            "course_id": order.course_id,
            "buyer_name": user.name if user else "Unknown",
            "buyer_email": user.email if user else "",
            "phone_number": order.phone_number or "",
            "course_name": course.title if course else "Unknown course",
            "amount": float(order.final_amount),
            "discount": float(order.discount_amount),
            "status": order.status,
            "order_id": order.razorpay_order_id,
            "payment_id": order.razorpay_payment_id,
            "date": order.created_at,
        })

    return result


@router.get("/users")
def users(admin=Depends(admin_user), db: Session = Depends(get_db)):
    rows = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "disabled": u.disabled,
            "created_at": u.created_at,
        }
        for u in rows
    ]


@router.get("/reviews")
def reviews(admin=Depends(admin_user), db: Session = Depends(get_db)):
    rows = db.query(Review).order_by(Review.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "course_id": r.course_id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "status": r.status,
            "featured": r.featured,
            "verified_purchase": r.verified_purchase,
            "created_at": r.created_at,
        }
        for r in rows
    ]


@router.patch("/reviews/{review_id}")
def moderate_review(review_id: int, payload: dict, admin=Depends(admin_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(404, "Review not found")

    if "status" in payload and payload["status"] not in {"pending", "approved", "hidden"}:
        raise HTTPException(400, "Invalid review status")

    if "status" in payload:
        review.status = payload["status"]
    if "featured" in payload:
        review.featured = bool(payload["featured"])

    db.commit()
    return {"message": "Review updated"}
