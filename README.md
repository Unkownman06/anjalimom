# Ananda Yoga — Premium Yoga Course Platform

A production-oriented full-stack yoga course platform based on the supplied requirements.

## Stack
- Frontend: React + TypeScript + Vite + React Router + Firebase Auth + Razorpay Checkout
- Backend: FastAPI + SQLAlchemy + PostgreSQL/SQLite + Firebase Admin SDK + Razorpay
- Auth: Firebase email/password + Google OAuth; backend verifies Firebase ID tokens
- Payments: Razorpay server-side order creation and signature verification
- Access control: backend-enforced member/admin/course entitlement checks

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
npm run dev
```

Open http://localhost:5173.

## Required production configuration

Firebase:
- Create a Firebase project.
- Enable Email/Password and Google providers.
- Create a Web App and put its config in `frontend/.env`.
- Create a Firebase service account and put its credentials in the backend environment.

Razorpay:
- Put the key ID in the frontend environment.
- Put key ID + secret in backend environment.
- Configure Razorpay webhooks to `/api/payments/webhook`.

Database:
- SQLite is used by default for local development.
- Set `DATABASE_URL` to PostgreSQL for production.

## Admin
The backend does not trust a frontend "admin" flag. Add an authenticated Firebase user's UID to `ADMIN_UIDS` in the backend environment or set that user's role to `admin` in the database.

## Important security behavior
- WhatsApp invite URLs are never returned by public course endpoints.
- The protected WhatsApp endpoint checks authentication and an active enrollment before returning the link.
- Review creation checks enrollment server-side.
- Razorpay signatures are verified server-side.
- Admin endpoints check the authenticated user's admin role.
- No fake payment success is implemented.

## Course content
The course content model is ready for curriculum lessons and progress tracking. Replace the seed/demo courses with your real content and supplied brand assets.
