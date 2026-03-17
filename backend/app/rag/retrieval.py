from __future__ import annotations

import json
from dataclasses import dataclass

import numpy as np
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Chunk, Document
from app.db.vector import VectorStore
from app.rag.embeddings import get_embedding_service
from app.schemas import Citation


@dataclass
class RetrievedChunk:
    text: str
    distance: float
    citation: Citation


class RetrievalService:
    def __init__(self) -> None:
        self.embeddings = get_embedding_service()
        self.vector = VectorStore()

    def retrieve(self, db: Session, persona_scope: str, query: str, top_k: int = 6) -> list[RetrievedChunk]:
        q = self.embeddings.embed_query(query)
        candidates = self.vector.search(q, max(top_k * 4, top_k))

        if candidates:
            ids = [cid for cid, _ in candidates]
            score_map = {cid: dist for cid, dist in candidates}
            rows = db.execute(
                select(Chunk, Document)
                .join(Document, Chunk.document_id == Document.id)
                .where(Chunk.id.in_(ids), Chunk.persona_scope == persona_scope)
            ).all()
            rows.sort(key=lambda row: score_map.get(row[0].id, 1e9))
            return [self._as_retrieved(chunk, doc, score_map.get(chunk.id, 1e9)) for chunk, doc in rows[:top_k]]

        return self._fallback_cosine(db, persona_scope, q, top_k)

    def _fallback_cosine(self, db: Session, persona_scope: str, q: list[float], top_k: int) -> list[RetrievedChunk]:
        rows = db.execute(
            select(Chunk, Document)
            .join(Document, Chunk.document_id == Document.id)
            .where(Chunk.persona_scope == persona_scope, Chunk.embedding_json.isnot(None))
            .limit(350)
        ).all()
        if not rows:
            return []

        q_vec = np.array(q, dtype=np.float32)
        q_norm = np.linalg.norm(q_vec) or 1.0
        scored: list[tuple[float, Chunk, Document]] = []
        for chunk, doc in rows:
            emb = np.array(json.loads(chunk.embedding_json or "[]"), dtype=np.float32)
            if emb.size == 0:
                continue
            denom = (np.linalg.norm(emb) * q_norm) or 1.0
            distance = 1.0 - float(np.dot(q_vec, emb) / denom)
            scored.append((distance, chunk, doc))

        scored.sort(key=lambda item: item[0])
        return [self._as_retrieved(chunk, doc, dist) for dist, chunk, doc in scored[:top_k]]

    def _as_retrieved(self, chunk: Chunk, doc: Document, distance: float) -> RetrievedChunk:
        metadata = json.loads(chunk.metadata_json or "{}")
        tags = metadata.get("framework_tags") or []
        citation = Citation(
            source_id=doc.source_id,
            title=doc.title or doc.source_uri,
            url=doc.source_uri,
            excerpt=chunk.text[:220],
            framework_tag=tags[0] if isinstance(tags, list) and tags else None,
        )
        return RetrievedChunk(text=chunk.text, distance=distance, citation=citation)
