from pydantic import model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Company Knowledge Assistant"
    APP_ENV: str = "development"
    DATABASE_URL: str = ""
    UPLOAD_DIR: str = "uploads"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHAT_PROVIDER: str = "openai"
    CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str = ""
    XAI_API_KEY: str = ""
    GROK_API_KEY: str = ""
    GROK_CHAT_MODEL: str = "grok-4.20-reasoning"
    XAI_BASE_URL: str = "https://api.x.ai/v1"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_API_KEY: str = ""
    CLAUDE_CHAT_MODEL: str = "claude-sonnet-4-20250514"
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    SEED_DEMO_USERS: bool = True

    @model_validator(mode="after")
    def validate_required_settings(self) -> "Settings":
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")
        if self.APP_ENV.lower() in {"production", "prod"} and self.JWT_SECRET == "change-me-in-production":
            raise ValueError("JWT_SECRET must be set to a strong secret in production")
        return self

    class Config:
        env_file = ".env"


settings = Settings()
