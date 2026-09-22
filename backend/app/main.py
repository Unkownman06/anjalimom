from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .config import settings
from .db import Base, engine, SessionLocal
from .seed import seed
from .routers import courses, users, payments, admin

app = FastAPI(title="Ananda Yoga API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.cors_origins.split(",")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed(db)

app.include_router(courses.router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(admin.router)

@app.get("/health")
def health():
    return {"ok": True, "service": "ananda-yoga-api"}
