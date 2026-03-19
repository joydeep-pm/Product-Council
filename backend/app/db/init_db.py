from __future__ import annotations

from app.db.models import Base
from app.db.session import get_engine
from app.db.vector import VectorStore


def init_db() -> None:
    """Initialize database tables."""
    engine = get_engine()
    Base.metadata.create_all(bind=engine)
    VectorStore().ensure_table()
