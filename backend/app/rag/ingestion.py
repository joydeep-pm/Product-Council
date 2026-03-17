from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

import yaml
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.models import Chunk, Document, IngestRun
from app.db.vector import VectorStore
from app.rag.chunking import chunk_text, normalize_text
from app.rag.embeddings import get_embedding_service
from app.rag.sources import (
    CodaExportDropAdapter,
    discover_paul_graham_essay_urls,
    fetch_url_text,
    LocalFolderSource,
    PaulWebSource,
    SourceDocument,
    StratecheryExportDropAdapter,
    slugify,
)


PERSONA_DIRS = {
    "paul_graham": "pg",
    "shreyas": "shreyas",
    "operator_collective": "lenny_podcasts",
    "ben_thompson": "stratechery",
}


@dataclass
class SeedStats:
    fetched: int = 0
    skipped: int = 0
    failed: int = 0


@dataclass
class ReindexStats:
    documents_indexed: int = 0
    documents_skipped: int = 0
    chunks_indexed: int = 0


@dataclass
class PaulGrahamSyncStats:
    discovered: int = 0
    fetched: int = 0
    skipped: int = 0
    failed: int = 0


class IngestionService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.embedding_service = get_embedding_service()
        self.vector_store = VectorStore()

    def seed_free_data(self) -> SeedStats:
        stats = SeedStats()
        manifest_path = self.settings.free_seed_manifest
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        if not manifest_path.exists():
            return stats

        manifest = yaml.safe_load(manifest_path.read_text(encoding="utf-8")) or {}
        for item in manifest.get("sources", []):
            persona_scope = str(item.get("persona_scope", "")).strip()
            url = str(item.get("url", "")).strip()
            if not persona_scope or not url or persona_scope not in PERSONA_DIRS:
                stats.failed += 1
                continue
            try:
                docs = PaulWebSource([url]).list_documents() if persona_scope == "paul_graham" else []
                if not docs:
                    from app.rag.sources import fetch_url_text, slugify

                    text, title = fetch_url_text(url)
                    docs = [
                        SourceDocument(
                            persona_scope=persona_scope,
                            source_id=f"{persona_scope}:{slugify(title)}",
                            source_uri=url,
                            source_type="web",
                            title=title,
                            text=text,
                            license_note=item.get("license_note"),
                            framework_tags=item.get("framework_tags") or [],
                        )
                    ]

                target_dir = self.settings.data_root / PERSONA_DIRS[persona_scope]
                target_dir.mkdir(parents=True, exist_ok=True)

                for doc in docs:
                    safe_name = doc.source_id.split(":", 1)[-1]
                    out_file = target_dir / f"{safe_name}.md"
                    content = normalize_text(doc.text)
                    if out_file.exists() and out_file.read_text(encoding="utf-8", errors="ignore") == content:
                        stats.skipped += 1
                        continue
                    out_file.write_text(content, encoding="utf-8")
                    stats.fetched += 1
            except Exception:
                stats.failed += 1
        return stats

    def sync_paul_graham_essays(self, max_essays: int = 120) -> PaulGrahamSyncStats:
        stats = PaulGrahamSyncStats()
        target_dir = self.settings.data_root / PERSONA_DIRS["paul_graham"]
        target_dir.mkdir(parents=True, exist_ok=True)

        urls = discover_paul_graham_essay_urls()
        stats.discovered = len(urls)

        for url in urls[:max_essays]:
            try:
                text, title = fetch_url_text(url)
                normalized = normalize_text(text)
                if not normalized:
                    stats.failed += 1
                    continue

                path_slug = Path(urlparse(url).path).stem.strip().lower()
                filename = f"{path_slug or slugify(title)}.md"
                out_file = target_dir / filename

                payload = (
                    f"Source URL: {url}\n"
                    f"Source Title: {title.strip()}\n\n"
                    f"{normalized}\n"
                )
                if out_file.exists() and out_file.read_text(encoding="utf-8", errors="ignore") == payload:
                    stats.skipped += 1
                    continue
                out_file.write_text(payload, encoding="utf-8")
                stats.fetched += 1
            except Exception:
                stats.failed += 1

        return stats

    def reindex(self, db: Session) -> ReindexStats:
        stats = ReindexStats()
        run = IngestRun(run_type="reindex", status="started", details_json="{}")
        db.add(run)
        db.commit()

        try:
            sources = self._collect_sources()
            for source in sources:
                self._ingest_document(db, source, stats)
            run.status = "completed"
            run.details_json = json.dumps(stats.__dict__)
            db.add(run)
            db.commit()
            return stats
        except Exception as exc:
            run.status = "failed"
            run.details_json = json.dumps({"error": str(exc)})
            db.add(run)
            db.commit()
            raise

    def _collect_sources(self) -> list[SourceDocument]:
        data_root = self.settings.data_root
        docs: list[SourceDocument] = []
        docs.extend(LocalFolderSource("paul_graham", data_root / "pg").list_documents())
        docs.extend(LocalFolderSource("shreyas", data_root / "shreyas").list_documents())
        docs.extend(LocalFolderSource("operator_collective", data_root / "lenny_podcasts").list_documents())
        docs.extend(LocalFolderSource("ben_thompson", data_root / "stratechery").list_documents())
        docs.extend(CodaExportDropAdapter(data_root / "shreyas" / "_drop").list_documents())
        docs.extend(StratecheryExportDropAdapter(data_root / "stratechery" / "_drop").list_documents())
        return docs

    def _ingest_document(self, db: Session, source: SourceDocument, stats: ReindexStats) -> None:
        existing = db.execute(
            select(Document).where(
                Document.persona_scope == source.persona_scope,
                Document.source_uri == source.source_uri,
            )
        ).scalar_one_or_none()

        if existing and existing.content_hash == source.content_hash:
            stats.documents_skipped += 1
            return

        if existing:
            chunk_ids = [row[0] for row in db.execute(select(Chunk.id).where(Chunk.document_id == existing.id)).all()]
            self.vector_store.delete(chunk_ids)
            db.execute(delete(Chunk).where(Chunk.document_id == existing.id))
            db.delete(existing)
            db.commit()

        doc = Document(
            persona_scope=source.persona_scope,
            source_id=source.source_id,
            source_uri=source.source_uri,
            source_type=source.source_type,
            title=source.title,
            author=source.author,
            published_at=source.published_at,
            content_hash=source.content_hash,
            license_note=source.license_note,
            metadata_json=json.dumps({"framework_tags": source.framework_tags or []}),
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)

        spans = chunk_text(source.text)
        if not spans:
            stats.documents_skipped += 1
            return

        chunk_rows: list[Chunk] = []
        chunk_texts: list[str] = []
        for idx, span in enumerate(spans):
            metadata = {
                "persona_scope": source.persona_scope,
                "source_type": source.source_type,
                "source_uri": source.source_uri,
                "source_title": source.title,
                "framework_tags": source.framework_tags or [],
                "section_title": span.section_title,
            }
            row = Chunk(
                document_id=doc.id,
                persona_scope=source.persona_scope,
                chunk_index=idx,
                text=span.text,
                char_start=span.char_start,
                char_end=span.char_end,
                token_estimate=max(1, len(span.text) // 4),
                metadata_json=json.dumps(metadata),
            )
            chunk_rows.append(row)
            chunk_texts.append(span.text)

        db.add_all(chunk_rows)
        db.commit()
        for row in chunk_rows:
            db.refresh(row)

        embeddings = self.embedding_service.embed_texts(chunk_texts)
        for row, emb in zip(chunk_rows, embeddings):
            row.embedding_json = json.dumps(emb)
            db.add(row)
        db.commit()

        self.vector_store.upsert([row.id for row in chunk_rows], embeddings)

        stats.documents_indexed += 1
        stats.chunks_indexed += len(chunk_rows)
