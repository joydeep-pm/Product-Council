from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Strategy Council API"
    api_prefix: str = "/api/v1"
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    cors_origins_raw: str | None = None

    database_url: str = Field(default=f"sqlite:///{(BASE_DIR / 'strategy_council.db').as_posix()}")
    embedding_model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_dimension: int = 384
    embedding_batch_size: int = 32

    model_name: str = "gpt-4o-mini"
    openai_api_key: str | None = None
    openai_base_url: str | None = None
    llm_timeout_seconds: float = 45.0

    data_root: Path = Field(default=BASE_DIR / "data")
    free_seed_manifest: Path = Field(default=BASE_DIR / "data" / "_manifest" / "free_sources.yaml")

    @property
    def cors_origins(self) -> list[str]:
        raw = self.cors_origins_raw or self.allowed_origins
        return [item.strip() for item in raw.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
