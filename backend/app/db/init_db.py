from __future__ import annotations

from app.db.models import Base
from app.db.session import engine
from app.db.vector import VectorStore


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    VectorStore().ensure_table()
