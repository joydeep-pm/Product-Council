from __future__ import annotations

import asyncio
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import SessionRecord
from app.orchestrator.llm_client import LlmClient
from app.orchestrator.prompts import PERSONA_NAMES, clash_prompt, persona_system_prompt, persona_user_prompt, synthesis_prompt
from app.rag.retrieval import RetrievalService
from app.schemas import (
    Actions306090,
    ClashResult,
    CouncilSessionResponse,
    PersonaResponse,
    PersonaId,
    SynthesisResult,
)


class CouncilOrchestrator:
    def __init__(self) -> None:
        self.retrieval = RetrievalService()
        self.llm = LlmClient()
        self.personas: list[PersonaId] = ["paul_graham", "shreyas", "operator_collective", "ben_thompson"]

    async def run_session(self, db: Session, query: str) -> CouncilSessionResponse:
        tasks = [self._run_persona(db, persona, query) for persona in self.personas]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        round_table: list[PersonaResponse] = []
        for persona, result in zip(self.personas, results):
            if isinstance(result, Exception):
                round_table.append(
                    PersonaResponse(
                        persona_id=persona,
                        persona_name=PERSONA_NAMES[persona],
                        response="[unavailable]",
                        citations=[],
                    )
                )
            else:
                round_table.append(result)

        round_json = json.dumps([item.model_dump() for item in round_table], ensure_ascii=False)

        clash_data = self.llm.generate_json(
            "You identify core strategic friction from multiple viewpoints.",
            clash_prompt(query, round_json),
            {
                "friction_point": "Execution sequencing versus strategic optionality.",
                "why_it_matters": "Prioritization errors can burn runway and team focus.",
                "tradeoff_axes": ["speed vs certainty", "focus vs flexibility"],
            },
        )
        clash = ClashResult(**clash_data)

        synthesis_data = self.llm.generate_json(
            "You synthesize strategy into actionable plan.",
            synthesis_prompt(query, round_json, json.dumps(clash.model_dump())),
            {
                "recommendation": "Run a focused 90-day strategy cycle with explicit hypotheses.",
                "actions_30_60_90": {
                    "days_0_30": ["Define target segment", "Lock one north-star metric"],
                    "days_31_60": ["Ship two high-confidence bets", "Collect decision-grade evidence"],
                    "days_61_90": ["Double down on winning thesis", "Sunset weak initiatives"],
                },
                "risks": ["Overfitting early signals", "Team thrash from context switching"],
                "leading_indicators": ["Activation rate", "Retention trend", "Cycle-time to decision"],
            },
        )
        synthesis = SynthesisResult(
            recommendation=synthesis_data.get("recommendation", "No recommendation generated."),
            actions_30_60_90=Actions306090(**synthesis_data.get("actions_30_60_90", {})),
            risks=synthesis_data.get("risks", []),
            leading_indicators=synthesis_data.get("leading_indicators", []),
        )

        session = CouncilSessionResponse(
            session_id=str(uuid.uuid4()),
            created_at=datetime.now(timezone.utc),
            query=query,
            round_table=round_table,
            clash=clash,
            synthesis=synthesis,
        )

        self._persist(db, session)
        return session

    async def _run_persona(self, db: Session, persona_id: PersonaId, query: str) -> PersonaResponse:
        if persona_id == "paul_graham":
            context_chunks = []
        else:
            context_chunks = self.retrieval.retrieve(db, persona_id, query, top_k=6)

        context = "\n\n".join([f"[Source] {chunk.citation.title}:\n{chunk.text}" for chunk in context_chunks])
        citations = [chunk.citation for chunk in context_chunks[:4]]

        response = await asyncio.to_thread(
            self.llm.generate_text,
            persona_system_prompt(persona_id),
            persona_user_prompt(query, context, persona_id),
        )

        return PersonaResponse(
            persona_id=persona_id,
            persona_name=PERSONA_NAMES[persona_id],
            response=response,
            citations=citations,
        )

    def _persist(self, db: Session, session: CouncilSessionResponse) -> None:
        record = SessionRecord(
            id=session.session_id,
            query=session.query,
            status="completed",
            friction_summary=session.clash.friction_point,
            synthesis_summary=session.synthesis.recommendation[:180],
            payload_json=json.dumps(session.model_dump(mode="json")),
        )
        db.add(record)
        db.commit()

    def list_sessions(self, db: Session, limit: int, offset: int) -> tuple[list[SessionRecord], int]:
        items = db.execute(
            select(SessionRecord).order_by(SessionRecord.created_at.desc()).limit(limit).offset(offset)
        ).scalars().all()
        total = db.execute(select(SessionRecord)).scalars().all()
        return items, len(total)

    def get_session(self, db: Session, session_id: str) -> CouncilSessionResponse | None:
        record = db.execute(select(SessionRecord).where(SessionRecord.id == session_id)).scalar_one_or_none()
        if not record:
            return None
        return CouncilSessionResponse(**json.loads(record.payload_json))
