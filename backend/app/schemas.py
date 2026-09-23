from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, HttpUrl, ConfigDict

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    profile_image: str | None = None
    role: str
    created_at: datetime

class ServiceIn(BaseModel):
    name: str
    description: str = ""

class CurriculumIn(BaseModel):
    title: str
    duration: str = "10 min"
    position: int = 1

class CourseIn(BaseModel):
    title: str
    slug: str
    image: str | None = None
    short_description: str = ""
    description: str = ""
    category: str = "Yoga"
    difficulty: str = "Beginner"
    duration: str = "30 days"
    sessions: int = 30
    instructor: str = ""
    original_price: Decimal = Field(ge=0)
    selling_price: Decimal = Field(ge=0)
    status: str = "draft"
    whatsapp_invite_link: str | None = None
    whatsapp_enabled: bool = False
    services: list[ServiceIn] = []
    benefits: list[str] = []
    curriculum: list[CurriculumIn] = []

class ReviewIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=10, max_length=2000)

class DiscountIn(BaseModel):
    kind: str = "percent"
    value: Decimal = Field(gt=0)
    start_date: datetime
    end_date: datetime
