from __future__ import annotations

import json
import logging
import sqlite3

from app.config import get_settings

logger = logging.getLogger(__name__)


class VectorStore:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._vec_enabled = False
        self._is_sqlite = self.settings.database_url.startswith("sqlite")

    def _db_path(self) -> str:
        url = self.settings.database_url
        if not url.startswith("sqlite:///"):
            raise ValueError("Only sqlite:/// URLs are supported")
        return url.replace("sqlite:///", "")

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path())
        conn.row_factory = sqlite3.Row
        try:
            import sqlite_vec

            if hasattr(conn, "enable_load_extension"):
                conn.enable_load_extension(True)
                sqlite_vec.load(conn)
                conn.enable_load_extension(False)
                self._vec_enabled = True
        except Exception as exc:  # pragma: no cover
            logger.warning("sqlite-vec extension not loaded: %s", exc)
            self._vec_enabled = False
        return conn

    def ensure_table(self) -> None:
        # Skip vector table creation for non-SQLite databases
        if not self._is_sqlite:
            logger.info("Skipping vector table creation for non-SQLite database")
            return

        conn = self._connect()
        try:
            if self._vec_enabled:
                conn.execute(
                    """
                    CREATE VIRTUAL TABLE IF NOT EXISTS chunk_vec
                    USING vec0(embedding float[384])
                    """
                )
            else:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS chunk_vec (
                        rowid INTEGER PRIMARY KEY,
                        embedding TEXT NOT NULL
                    )
                    """
                )
            conn.commit()
        finally:
            conn.close()

    def upsert(self, chunk_ids: list[int], embeddings: list[list[float]]) -> None:
        if not chunk_ids or not self._is_sqlite:
            return
        conn = self._connect()
        try:
            for chunk_id, embedding in zip(chunk_ids, embeddings):
                conn.execute("DELETE FROM chunk_vec WHERE rowid = ?", (chunk_id,))
                conn.execute(
                    "INSERT INTO chunk_vec(rowid, embedding) VALUES (?, ?)",
                    (chunk_id, json.dumps(embedding)),
                )
            conn.commit()
        finally:
            conn.close()

    def delete(self, chunk_ids: list[int]) -> None:
        if not chunk_ids or not self._is_sqlite:
            return
        conn = self._connect()
        try:
            conn.executemany("DELETE FROM chunk_vec WHERE rowid = ?", [(cid,) for cid in chunk_ids])
            conn.commit()
        finally:
            conn.close()

    def search(self, query_embedding: list[float], k: int) -> list[tuple[int, float]]:
        # Skip vector search for non-SQLite databases
        if not self._is_sqlite:
            return []

        conn = self._connect()
        if not self._vec_enabled:
            conn.close()
            return []
        try:
            rows = conn.execute(
                "SELECT rowid, distance FROM chunk_vec WHERE embedding MATCH ? AND k = ?",
                (json.dumps(query_embedding), k),
            ).fetchall()
            return [(int(r["rowid"]), float(r["distance"])) for r in rows]
        except Exception as exc:  # pragma: no cover
            logger.warning("Vector search unavailable, fallback to SQL cosine: %s", exc)
            return []
        finally:
            conn.close()
