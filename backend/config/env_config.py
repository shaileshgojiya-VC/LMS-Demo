"""This module contains configuration information."""

from functools import lru_cache
from os.path import join

from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from pydantic import ConfigDict

from .project_path import BASE_DIR

# Load .env file
dotenv_path = join(BASE_DIR, ".env")
load_dotenv(dotenv_path)


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database Configuration
    DATABASE_URL: str
    DATABASE_NAME: str | None = None
    DATABASE_USER: str | None = None
    DATABASE_PASSWORD: str | None = None
    DATABASE_HOST: str | None = None
    DATABASE_PORT: str | None = None

    # Server Configuration
    SERVER_HOST: str | None = None
    SERVER_PORT: int | None = None

    # JWT Configuration
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    # Application Configuration
    SECRET_KEY: str
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Email Configuration
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_USE_TLS: bool = True
    EMAIL_USERNAME: str | None = None
    DEFAULT_FROM_EMAIL: str = "noreply@everycred.com"

    # Frontend Configuration
    FRONTEND_URL: str = "http://localhost:3000"

    # Session
    SESSION_SECRET_KEY: str = ""
    
    # EveryCRED Configuration
    EVERYCRED_API_URL: str = "http://localhost:8000/api/v1"
    EVERYCRED_API_TOKEN: str = ""
    EVERYCRED_ISSUER_ID: str = ""
    EVERYCRED_GROUP_ID: str = ""
    EVERYCRED_SUBJECT_ID: str = ""
    EVERYCRED_MOCK_MODE: bool = True

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
