from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./ananda.db"
    cors_origins: str = "http://localhost:5173"
    upload_dir: str = "uploads"
    firebase_project_id: str = ""
    firebase_client_email: str = ""
    firebase_private_key: str = ""
    firebase_clock_skew_seconds: int = 10
    admin_uids: str = ""
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def admin_uid_set(self):
        return {x.strip() for x in self.admin_uids.split(",") if x.strip()}

settings = Settings()
