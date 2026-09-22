from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .config import settings
from .db import get_db
from .models import User

try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth
except Exception:
    firebase_admin = None
    credentials = None
    firebase_auth = None

def _init_firebase():
    if not firebase_admin or firebase_admin._apps:
        return
    if not (settings.firebase_project_id and settings.firebase_client_email and settings.firebase_private_key):
        return
    cred = credentials.Certificate({
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        "client_email": settings.firebase_client_email,
        "token_uri": "https://oauth2.googleapis.com/token",
    })
    firebase_admin.initialize_app(cred)

_init_firebase()

def current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Authentication required")
    if not firebase_auth:
        raise HTTPException(503, "Firebase Admin SDK is not configured")
    token = authorization.split(" ", 1)[1]
    try:
        # Always verify the Firebase ID token against this Firebase project.
        # The frontend also refreshes the token once when a 401 is returned.
        decoded = firebase_auth.verify_id_token(
            token,
            clock_skew_seconds=max(0, settings.firebase_clock_skew_seconds),
        )
    except Exception as exc:
        # Keep the client-facing message safe, but log the real reason locally
        # so configuration/project/token problems can be diagnosed.
        print(f"[Firebase auth] token verification failed: {type(exc).__name__}: {exc}")
        raise HTTPException(401, "Invalid or expired authentication token")
    uid = decoded["uid"]
    # Admin can be granted either by the Firebase custom claim {"admin": true}
    # or by listing the Firebase Authentication UID in ADMIN_UIDS.
    firebase_admin_claim = decoded.get("admin") is True
    should_be_admin = firebase_admin_claim or uid in settings.admin_uid_set

    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        user = User(
            firebase_uid=uid,
            email=decoded.get("email", ""),
            name=decoded.get("name", "") or "",
            profile_image=decoded.get("picture"),
            role="admin" if should_be_admin else "member",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Synchronize the local role with Firebase authorization on every
        # authenticated request. This prevents a stale admin role from
        # surviving after the UID is removed from ADMIN_UIDS or the Firebase
        # admin claim is removed.
        desired_role = "admin" if should_be_admin else "member"
        changed = False
        if user.role != desired_role:
            user.role = desired_role
            changed = True
        if decoded.get("email") and user.email != decoded.get("email"):
            user.email = decoded.get("email")
            changed = True
        if decoded.get("name") and user.name != decoded.get("name"):
            user.name = decoded.get("name") or ""
            changed = True
        if decoded.get("picture") and user.profile_image != decoded.get("picture"):
            user.profile_image = decoded.get("picture")
            changed = True
        if changed:
            db.commit()
            db.refresh(user)

    if user.disabled:
        raise HTTPException(403, "Account disabled")
    return user

def admin_user(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user
