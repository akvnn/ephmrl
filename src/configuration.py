import json
from enum import Enum
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Configuration"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # API Configuration
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    API_PORT: int = 8000

    # Database Configuration
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost/postgres"

    # JWT for native auth (RS256)
    JWT_PRIVATE_KEY: str
    JWT_PUBLIC_KEY: str
    JWT_ISSUER: str = "https://ephmrl.ai"
    JWT_AUDIENCE: str = "https://api.ephemeral.com"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Auth0 Configuration
    AUTH0_DOMAIN: str | None = None
    AUTH0_API_AUDIENCE: str | None = None
    AUTH0_ISSUER: str | None = None
    AUTH0_ALGORITHMS: list[str] = ["RS256"]
    AUTH0_CLIENT_ID: str | None = None
    AUTH0_CLIENT_SECRET: str | None = None

    # Session Configuration
    SESSION_SECRET: str | None = None

    # Polar Configuration
    POLAR_WEBHOOK_SECRET: str | None = None

    # Resend Configuration
    RESEND_API_KEY: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"

    # Plugins Configuration
    PLUGINS_BASE_URL: str = "http://localhost:8001"

    @field_validator("AUTH0_ALGORITHMS", mode="before")
    @classmethod
    def parse_algorithms(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


config = Settings()
