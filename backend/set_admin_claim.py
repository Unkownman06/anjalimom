"""Grant Admin access to a Firebase Authentication user.

Usage (from backend folder):
    python set_admin_claim.py FIREBASE_UID

The Firebase Admin SDK service-account values are read from backend/.env.
After running this, sign out/in again so Firebase issues a fresh ID token.
"""
import sys
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

if len(sys.argv) != 2:
    raise SystemExit("Usage: python set_admin_claim.py FIREBASE_UID")

if not (settings.firebase_project_id and settings.firebase_client_email and settings.firebase_private_key):
    raise SystemExit("Firebase Admin credentials are missing from backend/.env")

if not firebase_admin._apps:
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        "client_email": settings.firebase_client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred)

uid = sys.argv[1].strip()
auth.set_custom_user_claims(uid, {"admin": True})
user = auth.get_user(uid)
print(f"Admin granted to {user.email or uid} ({uid}).")
print("Sign out and sign in again before testing the Admin login.")
