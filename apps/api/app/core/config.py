from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Company Knowledge Assistant"
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/rag_app"
    UPLOAD_DIR: str = "uploads"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    CHAT_MODEL: str = "gpt-4o-mini"
    OPENAI_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
