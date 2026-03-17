from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status

from app.db.session import get_db_session
from app.orchestrator.council_flow import CouncilOrchestrator
from app.schemas import CouncilSessionResponse, SessionCreateRequest, SessionListItem, SessionListResponse

router = APIRouter(prefix="/council/sessions", tags=["council"])
orchestrator = CouncilOrchestrator()


@router.post("", response_model=CouncilSessionResponse, status_code=status.HTTP_200_OK)
async def create_session(payload: SessionCreateRequest) -> CouncilSessionResponse:
    with get_db_session() as db:
        return await orchestrator.run_session(db, payload.query)


@router.get("", response_model=SessionListResponse, status_code=status.HTTP_200_OK)
def list_sessions(
    limit: int = Query(default=30, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> SessionListResponse:
    with get_db_session() as db:
        rows, total = orchestrator.list_sessions(db, limit=limit, offset=offset)

    items = [
        SessionListItem(
            session_id=row.id,
            created_at=row.created_at,
            query=row.query,
            friction_summary=row.friction_summary,
            synthesis_summary=row.synthesis_summary,
        )
        for row in rows
    ]
    return SessionListResponse(items=items, total=total)


@router.get("/{session_id}", response_model=CouncilSessionResponse, status_code=status.HTTP_200_OK)
def get_session(session_id: str) -> CouncilSessionResponse:
    with get_db_session() as db:
        session = orchestrator.get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
