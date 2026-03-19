from __future__ import annotations

from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings


settings = get_settings()

# Configure engine based on database type
connect_args = {}
pool_config = {}
db_url = settings.database_url

if settings.database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif settings.database_url.startswith("postgresql"):
    # Use pg8000 driver for PostgreSQL (pure Python, works in serverless)
    db_url = settings.database_url.replace("postgresql://", "postgresql+pg8000://")
    # PostgreSQL connection pool settings for production
    pool_config = {
        "pool_pre_ping": True,
        "pool_size": 5,
        "max_overflow": 10,
    }

engine = create_engine(
    db_url,
    connect_args=connect_args,
    future=True,
    **pool_config,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


@contextmanager
def get_db_session() -> Session:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
