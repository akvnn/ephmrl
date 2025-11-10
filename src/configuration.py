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
    )

    # API Configuration
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    API_PORT: int = 8000

    # Auth0 Configuration
    AUTH0_DOMAIN: str | None = None
    AUTH0_API_AUDIENCE: str | None = None
    AUTH0_ISSUER: str | None = None
    AUTH0_ALGORITHMS: list[str] = ["RS256"]
    AUTH0_CLIENT_ID: str | None = None
    AUTH0_CLIENT_SECRET: str | None = None

    # Session Configuration
    SESSION_SECRET: str | None = None

    @field_validator("AUTH0_ALGORITHMS", mode="before")
    @classmethod
    def parse_algorithms(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


config = Settings()
