from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..db import get_db
from ..models import Course, Review, Enrollment
from ..schemas import ReviewIn
from ..auth import current_user
from ..services import pricing

router = APIRouter(prefix="/api/courses", tags=["courses"])

def public_course(db, c):
    reviews = db.query(Review).filter(Review.course_id == c.id, Review.status == "approved").all()
    avg = round(sum(r.rating for r in reviews)/len(reviews), 2) if reviews else 0
    return {
        "id": c.id, "title": c.title, "slug": c.slug, "image": c.image,
        "short_description": c.short_description, "description": c.description,
        "category": c.category, "difficulty": c.difficulty, "duration": c.duration,
        "sessions": c.sessions, "instructor": c.instructor, "status": c.status,
        "services": [{"name": x.name, "description": x.description} for x in c.services],
        "benefits": [x.text for x in c.benefits],
        "curriculum": [{"title": x.title, "duration": x.duration, "position": x.position} for x in c.curriculum],
        "pricing": pricing(db, c),
        "whatsapp_included": bool(c.whatsapp_enabled and c.whatsapp_invite_link),
        "rating": avg, "review_count": len(reviews),
    }

@router.get("")
def list_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.status == "published").order_by(Course.created_at.desc()).all()
    return [public_course(db, c) for c in courses]

@router.get("/{slug}")
def get_course(slug: str, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.slug == slug, Course.status == "published").first()
    if not c: raise HTTPException(404, "Course not found")
    return public_course(db, c)

@router.get("/{course_id}/reviews")
def get_reviews(course_id: int, db: Session = Depends(get_db)):
    rows = db.query(Review).filter(Review.course_id == course_id, Review.status == "approved").order_by(Review.created_at.desc()).all()
    breakdown = {str(i): sum(1 for r in rows if r.rating == i) for i in range(1,6)}
    return {"reviews": [
        {"id": r.id, "rating": r.rating, "comment": r.comment, "created_at": r.created_at,
         "verified_purchase": r.verified_purchase, "featured": r.featured}
        for r in rows
    ], "breakdown": breakdown, "average": round(sum(r.rating for r in rows)/len(rows),2) if rows else 0}

@router.post("/{course_id}/reviews")
def create_review(course_id: int, payload: ReviewIn, db: Session = Depends(get_db), user=Depends(current_user)):
    enrollment = db.query(Enrollment).filter(Enrollment.course_id == course_id, Enrollment.user_id == user.id, Enrollment.status == "active").first()
    if not enrollment: raise HTTPException(403, "Course purchase required")
    if db.query(Review).filter(Review.course_id == course_id, Review.user_id == user.id).first():
        raise HTTPException(409, "You already reviewed this course")
    review = Review(course_id=course_id, user_id=user.id, rating=payload.rating, comment=payload.comment, verified_purchase=True)
    db.add(review); db.commit(); db.refresh(review)
    return {"message": "Review submitted", "review_id": review.id}
