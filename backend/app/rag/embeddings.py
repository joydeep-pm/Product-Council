from __future__ import annotations

import hashlib
import logging
from functools import lru_cache

import numpy as np

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._model = None
        self._fallback = False

    def _load_model(self):
        if self._fallback:
            return None
        if self._model is not None:
            return self._model
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.settings.embedding_model_name)
        except Exception as exc:  # pragma: no cover
            logger.warning("sentence-transformers unavailable; using deterministic hash embeddings: %s", exc)
            self._fallback = True
            return None
        return self._model

    def _hash_embedding(self, text: str) -> list[float]:
        digest = hashlib.sha256(text.encode("utf-8")).digest()
        seed = int.from_bytes(digest[:8], "big")
        rng = np.random.default_rng(seed)
        vec = rng.normal(size=self.settings.embedding_dimension).astype(np.float32)
        norm = np.linalg.norm(vec) or 1.0
        return (vec / norm).tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        model = self._load_model()
        if model is None:
            return [self._hash_embedding(text) for text in texts]

        vectors = model.encode(
            texts,
            batch_size=self.settings.embedding_batch_size,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
        return vectors.astype(np.float32).tolist()

    def embed_query(self, text: str) -> list[float]:
        return self.embed_texts([text])[0]


@lru_cache
def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()
