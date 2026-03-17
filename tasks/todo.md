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

## UI Remediation - 2026-03-17
- [x] Implement premium visual hierarchy and responsive shell refinements.
- [x] Upgrade council panels (Round Table, Clash, Synthesis, Empty, Loading) for readability and consistency.
- [x] Harden frontend API error handling with actionable misconfiguration and network guidance.
- [x] Run `npm run typecheck` and `npm run build` for frontend verification.
- [x] Document review notes and deployment guidance for Vercel env/base URL.

## UI Remediation Review
- Moved from flat dark dashboard styling to a lighter premium surface system while keeping burnt-orange accent identity.
- Reworked mobile behavior with a proper history drawer + backdrop and clearer top-level hierarchy.
- Added typed API error handling and surfaced actionable config guidance in the UI when API base URL is misconfigured.
- Frontend verification:
  - `npm run typecheck`: passed.
  - `npm run build`: passed.
- Deployment guidance: set `NEXT_PUBLIC_API_BASE_URL` to deployed backend URL (not frontend URL), and ensure Vercel Root Directory for the frontend project is `frontend`.

## Backend Deployment - 2026-03-17
- [x] Add Vercel Python backend entrypoint and routes config.
- [x] Deploy backend service to Vercel production.
- [x] Configure backend runtime env (`DATABASE_URL`, `ALLOWED_ORIGINS`) for serverless.
- [x] Verify backend health endpoint and council session endpoint from deployed URL.
- [x] Return final backend URL and frontend env value.

## Backend Deployment Review
- Added Vercel backend serverless entrypoint at `backend/api/index.py` and routing in `backend/vercel.json`.
- Resolved Vercel build-size failure by moving heavy local-only dependencies (`sentence-transformers`, pytest stack) into `backend/requirements-dev.txt`; runtime deps remain in `backend/requirements.txt`.
- Deployed backend URL:
  - `https://backend-1jcvq4yn0-joytdh-gmailcoms-projects.vercel.app`
  - stable alias: `https://backend-joytdh-gmailcoms-projects.vercel.app`
- Project-level Vercel deployment protection disabled (`ssoProtection: null`) to make API publicly callable from browser clients.
- Verified:
  - `GET /health` returns `200 {"status":"ok"}`
  - `GET /api/v1/council/sessions?limit=1` returns `200`
  - `POST /api/v1/council/sessions` returns a valid council payload.
- Updated frontend project env:
  - `NEXT_PUBLIC_API_BASE_URL=https://backend-joytdh-gmailcoms-projects.vercel.app`
- Redeployed frontend and re-aliased:
  - `https://product-council-jet.vercel.app`
