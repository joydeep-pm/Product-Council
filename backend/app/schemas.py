from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


PersonaId = Literal["paul_graham", "shreyas", "operator_collective", "ben_thompson"]


class Citation(BaseModel):
    source_id: str
    title: str
    url: str
    excerpt: str
    framework_tag: str | None = None
    relevance_score: float = 0.0
    author: str | None = None


class SourceCoverage(BaseModel):
    total_chunks_found: int
    avg_relevance: float
    has_direct_coverage: bool
    coverage_level: Literal["high", "medium", "low", "none"]


class PersonaResponse(BaseModel):
    persona_id: PersonaId
    persona_name: str
    response: str
    citations: list[Citation] = Field(default_factory=list)
    source_coverage: SourceCoverage = Field(
        default_factory=lambda: SourceCoverage(
            total_chunks_found=0,
            avg_relevance=0.0,
            has_direct_coverage=False,
            coverage_level="none"
        )
    )
    ai_generated_percentage: int = 0


class ClashResult(BaseModel):
    friction_point: str
    why_it_matters: str
    tradeoff_axes: list[str] = Field(default_factory=list)


class Actions306090(BaseModel):
    days_0_30: list[str] = Field(default_factory=list)
    days_31_60: list[str] = Field(default_factory=list)
    days_61_90: list[str] = Field(default_factory=list)


class SynthesisResult(BaseModel):
    recommendation: str
    actions_30_60_90: Actions306090
    risks: list[str] = Field(default_factory=list)
    leading_indicators: list[str] = Field(default_factory=list)


class SessionTurn(BaseModel):
    question: str
    created_at: datetime


class CouncilSessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    query: str
    turns: list[SessionTurn] = Field(default_factory=list)
    round_table: list[PersonaResponse]
    clash: ClashResult
    synthesis: SynthesisResult


class SessionCreateRequest(BaseModel):
    query: str = Field(min_length=3, max_length=4000)


class SessionQuestionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4000)


class SessionListItem(BaseModel):
    session_id: str
    created_at: datetime
    query: str
    question_count: int = 1
    friction_summary: str | None = None
    synthesis_summary: str | None = None


class SessionListResponse(BaseModel):
    items: list[SessionListItem]
    total: int


class ApiError(BaseModel):
    code: str
    message: str
    details: dict = Field(default_factory=dict)


class ErrorEnvelope(BaseModel):
    error: ApiError


class SeedResponse(BaseModel):
    fetched: int
    skipped: int
    failed: int


class ReindexResponse(BaseModel):
    documents_indexed: int
    documents_skipped: int
    chunks_indexed: int


class PaulGrahamSyncResponse(BaseModel):
    discovered: int
    fetched: int
    skipped: int
    failed: int
