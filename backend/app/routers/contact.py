from email.mime.text import MIMEText
import base64
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from ..config import settings

router = APIRouter(prefix="/api/contact", tags=["contact"])

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    query: str

def send_gmail_message(payload: ContactRequest):
    if not all([settings.gmail_client_id, settings.gmail_client_secret, settings.gmail_refresh_token, settings.gmail_to_email]):
        raise HTTPException(status_code=503, detail="Contact email service is not configured yet.")
    creds = Credentials(
        token=None,
        refresh_token=settings.gmail_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.gmail_client_id,
        client_secret=settings.gmail_client_secret,
        scopes=["https://www.googleapis.com/auth/gmail.send"],
    )
    try:
        creds.refresh(Request())
        service = build("gmail", "v1", credentials=creds, cache_discovery=False)
        body = f"Name: {payload.name}\nEmail: {payload.email}\n\nQuery:\n{payload.query}"
        message = MIMEText(body, "plain", "utf-8")
        message["to"] = settings.gmail_to_email
        message["from"] = settings.gmail_to_email
        message["reply-to"] = str(payload.email)
        message["subject"] = f"Aarogyam Space Studio enquiry from {payload.name}"
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unable to send the email right now. Please try again later.") from exc

@router.post("")
def contact(payload: ContactRequest):
    send_gmail_message(payload)
    return {"ok": True, "message": "Your query has been sent."}
