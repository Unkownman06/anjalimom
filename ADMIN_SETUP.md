# Ananda Yoga – Admin setup

## Single login page
The login page now has **User** and **Admin** selectors.
- User -> `/dashboard`
- Admin -> `/admin`
- Google login is available for User mode only.

Selecting Admin does not grant access by itself. The backend verifies the Firebase identity and role.

## Method 1: Firebase UID (recommended for local setup)
1. Firebase Console -> Authentication -> Users.
2. Open the admin user's account and copy the **User UID**.
3. Put it in `backend/.env`:
   `ADMIN_UIDS=YOUR_FIREBASE_UID`
4. Restart FastAPI.
5. Sign out and sign in again.

The backend now promotes an existing member to `admin` when that UID is in `ADMIN_UIDS`. Previously it only did this when the user was first created; that was the bug causing your Admin login to fall back to the normal dashboard.

## Method 2: Firebase custom claim
From the `backend` directory:

`python set_admin_claim.py YOUR_FIREBASE_UID`

This sets the Firebase custom claim `{ "admin": true }`. Then sign out and sign in again so Firebase issues a fresh ID token.

The backend accepts either the custom claim or `ADMIN_UIDS`.

## Security
Never commit `backend/.env`, Firebase service-account JSON, or private keys. The project archive intentionally excludes the real `.env`, virtual environment, node_modules, uploads, and local database.
