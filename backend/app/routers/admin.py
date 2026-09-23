from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..auth import admin_user
from ..db import get_db
from ..models import User, Course, CourseService, CourseBenefit, CurriculumItem, Discount, Order, Enrollment, CourseProgress, Review
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
        "whatsapp_enabled": c.whatsapp_enabled,
        "whatsapp_invite_link": c.whatsapp_invite_link,
        "whatsapp_configured": bool(c.whatsapp_invite_link),
        "services": [{"name": x.name, "description": x.description} for x in c.services],
        "benefits": [x.text for x in c.benefits],
        "curriculum": [{"title": x.title, "duration": x.duration, "position": x.position} for x in c.curriculum],
    }

@router.get("/summary")
def summary(admin=Depends(admin_user), db: Session=Depends(get_db)):
    total_revenue = sum(float(x.final_amount) for x in db.query(Order).filter(Order.status=="paid").all())
    return {
        "members": db.query(User).filter(User.role=="member").count(),
        "courses": db.query(Course).count(),
        "purchases": db.query(Order).filter(Order.status=="paid").count(),
        "revenue": total_revenue,
        "subscriptions": db.query(Enrollment).filter(Enrollment.status=="active").count(),
        "reviews": db.query(Review).filter(Review.status=="approved").count(),
        "average_rating": float(db.query(func.avg(Review.rating)).filter(Review.status=="approved").scalar() or 0),
    }

@router.get("/courses")
def courses(admin=Depends(admin_user), db: Session=Depends(get_db)):
    return [course_out(c) for c in db.query(Course).order_by(Course.created_at.desc()).all()]

@router.post("/courses")
def create_course(payload: CourseIn, admin=Depends(admin_user), db: Session=Depends(get_db)):
    if db.query(Course).filter(Course.slug==payload.slug).first(): raise HTTPException(409, "Slug already exists")
    c = Course(**payload.model_dump(exclude={"services","benefits","curriculum"}))
    db.add(c); db.flush()
    for x in payload.services: db.add(CourseService(course_id=c.id, **x.model_dump()))
    for x in payload.benefits: db.add(CourseBenefit(course_id=c.id, text=x))
    for x in payload.curriculum: db.add(CurriculumItem(course_id=c.id, **x.model_dump()))
    db.commit(); db.refresh(c)
    return course_out(c)

@router.put("/courses/{course_id}")
def update_course(course_id: int, payload: CourseIn, admin=Depends(admin_user), db: Session=Depends(get_db)):
    c = db.query(Course).filter(Course.id==course_id).first()
    if not c: raise HTTPException(404, "Course not found")
    for k,v in payload.model_dump(exclude={"services","benefits","curriculum"}).items(): setattr(c,k,v)
    c.services.clear(); c.benefits.clear(); c.curriculum.clear()
    for x in payload.services: c.services.append(CourseService(**x.model_dump()))
    for x in payload.benefits: c.benefits.append(CourseBenefit(text=x))
    for x in payload.curriculum: c.curriculum.append(CurriculumItem(**x.model_dump()))
    db.commit(); db.refresh(c); return course_out(c)

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, admin=Depends(admin_user), db: Session=Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(404, "Course not found")

    purchase_count = db.query(Order).filter(
        Order.course_id == course_id,
        Order.status == "paid",
    ).count()

    # Keep purchase history intact. Once a course has paid orders, it cannot
    # be physically deleted because orders reference the course. Archive it
    # instead so it disappears from the public catalogue but remains visible
    # in admin purchase history.
    if purchase_count:
        c.status = "archived"
        db.commit()
        return {
            "message": "Course archived because it has completed purchases",
            "deleted": False,
            "archived": True,
        }

    # No paid purchases: clean up dependent records before deleting.
    db.query(Review).filter(Review.course_id == course_id).delete(synchronize_session=False)
    db.query(CourseProgress).filter(CourseProgress.course_id == course_id).delete(synchronize_session=False)
    db.query(Enrollment).filter(Enrollment.course_id == course_id).delete(synchronize_session=False)
    db.query(Order).filter(Order.course_id == course_id).delete(synchronize_session=False)
    db.delete(c)
    db.commit()
    return {"message": "Course deleted", "deleted": True, "archived": False}

@router.post("/courses/{course_id}/discount")
def add_discount(course_id:int, payload:DiscountIn, admin=Depends(admin_user), db:Session=Depends(get_db)):
    if not db.query(Course).filter(Course.id==course_id).first(): raise HTTPException(404,"Course not found")
    d=Discount(course_id=course_id, **payload.model_dump())
    db.add(d); db.commit(); return {"message":"Discount added","id":d.id}

@router.get("/orders")
def orders(admin=Depends(admin_user), db:Session=Depends(get_db)):
    rows = (
        db.query(Order, User, Course)
        .join(User, User.id == Order.user_id)
        .outerjoin(Course, Course.id == Order.course_id)
        .order_by(Order.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": o.id,
            "user_id": o.user_id,
            "member_name": u.name or "Member",
            "member_email": u.email,
            "course_id": o.course_id,
            "course_title": c.title if c else "Deleted course",
            "amount": float(o.final_amount),
            "original_amount": float(o.original_amount),
            "discount": float(o.discount_amount),
            "status": o.status,
            "order_id": o.razorpay_order_id,
            "payment_id": o.razorpay_payment_id,
            "date": o.created_at,
        }
        for o, u, c in rows
    ]

@router.get("/courses/{course_id}/buyers")
def course_buyers(course_id: int, admin=Depends(admin_user), db: Session = Depends(get_db)):
    if not db.query(Course).filter(Course.id == course_id).first():
        raise HTTPException(404, "Course not found")

    rows = (
        db.query(Order, User)
        .join(User, User.id == Order.user_id)
        .filter(Order.course_id == course_id, Order.status == "paid")
        .order_by(Order.created_at.desc())
        .all()
    )
    return [
        {
            "user_id": u.id,
            "name": u.name or "Member",
            "email": u.email,
            "amount": float(o.final_amount),
            "status": o.status,
            "payment_id": o.razorpay_payment_id,
            "date": o.created_at,
        }
        for o, u in rows
    ]

@router.get("/users")
def users(admin=Depends(admin_user), db:Session=Depends(get_db)):
    rows=db.query(User).order_by(User.created_at.desc()).all()
    return [{"id":u.id,"name":u.name,"email":u.email,"role":u.role,"disabled":u.disabled,"created_at":u.created_at} for u in rows]

@router.get("/reviews")
def reviews(admin=Depends(admin_user), db:Session=Depends(get_db)):
    rows=db.query(Review).order_by(Review.created_at.desc()).all()
    return [{"id":r.id,"course_id":r.course_id,"user_id":r.user_id,"rating":r.rating,"comment":r.comment,"status":r.status,"featured":r.featured,"verified_purchase":r.verified_purchase,"created_at":r.created_at} for r in rows]

@router.patch("/reviews/{review_id}")
def moderate_review(review_id:int, payload:dict, admin=Depends(admin_user), db:Session=Depends(get_db)):
    r=db.query(Review).filter(Review.id==review_id).first()
    if not r: raise HTTPException(404,"Review not found")
    if "status" in payload and payload["status"] not in {"pending","approved","hidden"}: raise HTTPException(400,"Invalid review status")
    if "status" in payload: r.status=payload["status"]
    if "featured" in payload: r.featured=bool(payload["featured"])
    db.commit(); return {"message":"Review updated"}
