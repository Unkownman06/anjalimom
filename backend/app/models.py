from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, Boolean, DateTime, ForeignKey, Numeric, Integer, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160), default="")
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    profile_image: Mapped[str | None] = mapped_column(Text)
    authentication_provider: Mapped[str] = mapped_column(String(40), default="firebase")
    role: Mapped[str] = mapped_column(String(20), default="member", index=True)
    disabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    image: Mapped[str | None] = mapped_column(Text)
    short_description: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[str] = mapped_column(String(100), default="Yoga")
    difficulty: Mapped[str] = mapped_column(String(50), default="Beginner")
    duration: Mapped[str] = mapped_column(String(100), default="30 days")
    sessions: Mapped[int] = mapped_column(Integer, default=30)
    instructor: Mapped[str] = mapped_column(String(160), default="")
    original_price: Mapped[Decimal] = mapped_column(Numeric(10,2), default=0)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(10,2), default=0)
    status: Mapped[str] = mapped_column(String(20), default="published", index=True)
    whatsapp_invite_link: Mapped[str | None] = mapped_column(String(2000))
    whatsapp_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    services = relationship("CourseService", cascade="all, delete-orphan")
    benefits = relationship("CourseBenefit", cascade="all, delete-orphan")
    curriculum = relationship("CurriculumItem", cascade="all, delete-orphan")
    discounts = relationship("Discount", cascade="all, delete-orphan")

class CourseService(Base):
    __tablename__ = "course_services"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(String(500), default="")

class CourseBenefit(Base):
    __tablename__ = "course_benefits"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    text: Mapped[str] = mapped_column(String(300))

class CurriculumItem(Base):
    __tablename__ = "curriculum_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=1)
    title: Mapped[str] = mapped_column(String(200))
    duration: Mapped[str] = mapped_column(String(50), default="10 min")

class Discount(Base):
    __tablename__ = "discounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), index=True)
    kind: Mapped[str] = mapped_column(String(20), default="percent")
    value: Mapped[Decimal] = mapped_column(Numeric(10,2), default=0)
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(20), default="active")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    phone_number: Mapped[str] = mapped_column(String(20), default="")
    original_amount: Mapped[Decimal] = mapped_column(Numeric(10,2))
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(10,2), default=0)
    final_amount: Mapped[Decimal] = mapped_column(Numeric(10,2))
    currency: Mapped[str] = mapped_column(String(5), default="INR")
    status: Mapped[str] = mapped_column(String(30), default="created", index=True)
    razorpay_order_id: Mapped[str | None] = mapped_column(String(120), unique=True, index=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(120), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class Enrollment(Base):
    __tablename__ = "enrollments"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    status: Mapped[str] = mapped_column(String(30), default="active", index=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    end_date: Mapped[datetime | None] = mapped_column(DateTime)
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_user_course"),)

class CourseProgress(Base):
    __tablename__ = "course_progress"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    completed_lessons: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_progress"),)

class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="approved", index=True)
    verified_purchase: Mapped[bool] = mapped_column(Boolean, default=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (UniqueConstraint("user_id", "course_id", name="uq_review_user_course"),)

Index("ix_order_created", Order.created_at)
Index("ix_review_course_status", Review.course_id, Review.status)
