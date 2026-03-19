from __future__ import annotations

from contextlib import contextmanager
from typing import TYPE_CHECKING

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import get_settings

if TYPE_CHECKING:
    from sqlalchemy.engine import Engine
    from sqlalchemy.orm import sessionmaker as SessionMaker

# Lazy initialization for serverless environments
_engine: Engine | None = None
_SessionLocal: SessionMaker | None = None


def get_engine() -> Engine:
    """Get or create the database engine (lazy initialization)."""
    global _engine
    if _engine is None:
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
            # Remove sslmode parameter as pg8000 handles SSL differently
            db_url = db_url.split("?sslmode=")[0].split("&sslmode=")[0]
            # PostgreSQL connection pool settings for production
            pool_config = {
                "pool_pre_ping": True,
                "pool_size": 5,
                "max_overflow": 10,
            }

        _engine = create_engine(
            db_url,
            connect_args=connect_args,
            future=True,
            **pool_config,
        )
    return _engine


def get_session_local() -> SessionMaker:
    """Get or create the session factory (lazy initialization)."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=get_engine(),
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )
    return _SessionLocal


@contextmanager
def get_db_session() -> Session:
    """Get a database session with automatic cleanup."""
    SessionLocal = get_session_local()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
