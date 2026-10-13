import os
from typing import List
from pydantic_settings import BaseSettings

_DEFAULT_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ffd.db")).replace("\\", "/")

class Settings(BaseSettings):
    APP_NAME: str = "Financial Fraud Detector"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = f"sqlite:///{_DEFAULT_DB_PATH}"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    OPENAI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4o-mini"
    JWT_SECRET_KEY: str = "ffd-jwt-secret-key-production-ready-2026-auth-token"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    COOKIE_NAME: str = "ffd_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
