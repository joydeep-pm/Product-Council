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


class PersonaResponse(BaseModel):
    persona_id: PersonaId
    persona_name: str
    response: str
    citations: list[Citation] = Field(default_factory=list)


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


class CouncilSessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    query: str
    round_table: list[PersonaResponse]
    clash: ClashResult
    synthesis: SynthesisResult


class SessionCreateRequest(BaseModel):
    query: str = Field(min_length=3, max_length=4000)


class SessionListItem(BaseModel):
    session_id: str
    created_at: datetime
    query: str
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
