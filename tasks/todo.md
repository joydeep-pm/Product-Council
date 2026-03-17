# Strategy Council v1 - Execution Checklist

## Plan
- [x] Scaffold backend and frontend project structure.
- [x] Implement backend config, database models, sqlite-vec setup, and API routes.
- [x] Implement ingestion pipeline, source adapters, chunking, embeddings, and retrieval.
- [x] Implement council orchestration flow (round table, clash, synthesis) with persistence.
- [x] Implement frontend app shell, council UI, API client, and typed models.
- [x] Wire backend/frontend contracts and environment defaults.
- [x] Add tests for backend retrieval, orchestration, and API endpoints.
- [x] Run seed ingest + reindex + backend verification run.
- [x] Run frontend checks/build verification.

## Progress Notes
- Initialized repository directories: `backend/`, `frontend/`, `tasks/`.
- Rebuilt workspace after discarding sub-agent side-effect files (single-writer path).
- Added FastAPI backend with SQLite + sqlite-vec (with graceful non-extension fallback).
- Added local-first ingestion, free-source seeding, reindexing scripts, and persona-scoped retrieval.
- Added 3-phase council orchestration and persisted session replay payloads.
- Added Next.js frontend with premium minimalist UI, history sidebar, and session replay flow.
- Added Paul Graham crawler/sync stage (`/api/v1/ingest/sync-pg` + `backend/scripts/sync_pg_essays.py`) to auto-discover and fetch essays from `articles.html`.
- Hardened config pathing so `data_root` and DB paths resolve to `backend/` consistently regardless working directory.

## Review
- `pytest -q`: passed (2 tests).
- `python3 scripts/seed_free_data.py`: fetched 2, failed 3 (expected with mixed public/free availability).
- `python3 scripts/reindex.py`: indexed 2 documents, 4 chunks.
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `python3 backend/scripts/sync_pg_essays.py`: discovered 229, fetched 120, failed 0.
- `python3 backend/scripts/reindex.py` (from `/backend`): indexed 120 docs, 214 chunks; skipped 2 unchanged docs.
- `POST /api/v1/ingest/sync-pg?max_essays=1`: returned 200 with expected payload (`fetched: 0`, `skipped: 1` on rerun).
