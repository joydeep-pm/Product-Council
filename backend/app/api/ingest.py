from __future__ import annotations

from fastapi import APIRouter, status

from app.db.session import get_db_session
from app.rag.ingestion import IngestionService
from app.schemas import PaulGrahamSyncResponse, ReindexResponse, SeedResponse

router = APIRouter(prefix="/ingest", tags=["ingest"])


@router.post("/seed-free", response_model=SeedResponse, status_code=status.HTTP_200_OK)
def seed_free() -> SeedResponse:
    service = IngestionService()
    stats = service.seed_free_data()
    return SeedResponse(fetched=stats.fetched, skipped=stats.skipped, failed=stats.failed)


@router.post("/sync-pg", response_model=PaulGrahamSyncResponse, status_code=status.HTTP_200_OK)
def sync_paul_graham(max_essays: int = 120) -> PaulGrahamSyncResponse:
    service = IngestionService()
    stats = service.sync_paul_graham_essays(max_essays=max_essays)
    return PaulGrahamSyncResponse(
        discovered=stats.discovered,
        fetched=stats.fetched,
        skipped=stats.skipped,
        failed=stats.failed,
    )


@router.post("/reindex", response_model=ReindexResponse, status_code=status.HTTP_200_OK)
def reindex() -> ReindexResponse:
    service = IngestionService()
    with get_db_session() as db:
        stats = service.reindex(db)
    return ReindexResponse(
        documents_indexed=stats.documents_indexed,
        documents_skipped=stats.documents_skipped,
        chunks_indexed=stats.chunks_indexed,
    )
