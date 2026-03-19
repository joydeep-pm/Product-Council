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
    Citation,
    ClashResult,
    CouncilSessionResponse,
    PersonaResponse,
    PersonaId,
    SourceCoverage,
    SynthesisResult,
)


class CouncilOrchestrator:
    def __init__(self) -> None:
        self.retrieval = RetrievalService()
        self.llm = LlmClient()
        self.personas: list[PersonaId] = ["paul_graham", "shreyas", "operator_collective", "ben_thompson"]

    def _fallback_clash(self, query: str, round_table: list[PersonaResponse]) -> ClashResult:
        lower_query = query.lower()
        combined = " ".join(item.response.lower() for item in round_table)

        if any(term in lower_query for term in ["ai", "copilot", "prototype", "workflow", "pm"]):
            return ClashResult(
                friction_point="Whether to win by owning the PM's core workflow first or by layering AI assistance on top of an already-crowded toolchain.",
                why_it_matters="This determines whether the product earns daily habit and proprietary workflow context, or becomes a feature that incumbent tools can easily absorb.",
                tradeoff_axes=[
                    "workflow ownership vs assistant convenience",
                    "faster validation vs deeper defensibility",
                    "single-player utility vs team-scale coordination",
                ],
            )

        if "pricing" in lower_query or "monet" in lower_query:
            return ClashResult(
                friction_point="Whether to optimize for rapid adoption with simpler pricing or capture value early with a more opinionated monetization model.",
                why_it_matters="Pricing shape changes who adopts, what behavior gets reinforced, and how much room the company has to invest in the winning segment.",
                tradeoff_axes=[
                    "adoption speed vs monetization depth",
                    "simplicity vs segmentation precision",
                ],
            )

        if "enterprise" in lower_query or "self-serve" in lower_query or "gtm" in lower_query:
            return ClashResult(
                friction_point="Whether to narrow around one distribution motion or preserve optionality across multiple customer acquisition paths.",
                why_it_matters="Splitting attention across GTM motions too early weakens learning loops, slows execution, and makes it harder to build a coherent product wedge.",
                tradeoff_axes=[
                    "single GTM motion vs channel optionality",
                    "depth in one segment vs breadth across segments",
                ],
            )

        if "prototype" in combined and "copilot" in combined:
            return ClashResult(
                friction_point="Whether the immediate wedge should be a faster workflow or a smarter assistant.",
                why_it_matters="The wrong wedge can create novelty without habit, or habit without long-term strategic leverage.",
                tradeoff_axes=["habit formation vs feature sophistication", "speed to value vs strategic moat"],
            )

        return ClashResult(
            friction_point="Whether to choose a narrow wedge that compounds learning quickly or preserve flexibility across too many strategic options.",
            why_it_matters="The first constraint a startup accepts often determines whether it learns fast enough to discover a durable advantage.",
            tradeoff_axes=["focus vs optionality", "learning speed vs strategic breadth"],
        )

    def _fallback_synthesis(self, query: str, clash: ClashResult) -> SynthesisResult:
        lower_query = query.lower()

        if any(term in lower_query for term in ["ai", "copilot", "prototype", "workflow", "pm"]):
            return SynthesisResult(
                recommendation="Start with rapid prototyping workflows for individual PMs, then layer in AI assistance only where it materially improves iteration speed or decision quality. Do not start with broad collaboration or a general-purpose copilot.",
                actions_30_60_90=Actions306090(
                    days_0_30=[
                        "Pick one PM workflow to own end-to-end, such as turning rough ideas into testable prototypes.",
                        "Interview 10-15 PMs and identify the exact step where current tools create delay or rework.",
                    ],
                    days_31_60=[
                        "Ship a narrow prototype workflow with one clearly differentiated AI assist, such as generating variants or turning specs into clickable drafts.",
                        "Measure repeat usage from a small set of weekly active PM teams.",
                    ],
                    days_61_90=[
                        "Expand only the parts of collaboration that reinforce the core workflow, such as review, comments, or handoff.",
                        "Delay any broad copilot ambition until you see sustained pull and a clear proprietary context advantage.",
                    ],
                ),
                risks=[
                    "Building an AI layer that feels impressive but does not become part of the weekly PM workflow.",
                    "Adding collaboration too early and recreating generic project-management software.",
                ],
                leading_indicators=[
                    "weekly repeat prototype creation per active PM",
                    "time from idea to first testable artifact",
                    "percentage of sessions using the AI assist and continuing to a completed draft",
                ],
            )

        if "enterprise" in lower_query or "self-serve" in lower_query or "gtm" in lower_query:
            return SynthesisResult(
                recommendation="Choose one primary GTM motion for the next two quarters and align product work tightly to it. Treat other channels as learning inputs, not co-equal bets.",
                actions_30_60_90=Actions306090(
                    days_0_30=["Pick the primary segment and buying motion.", "Rewrite roadmap priorities to serve that motion explicitly."],
                    days_31_60=["Ship 2-3 features that reduce friction for that segment.", "Instrument conversion and retention for the chosen motion."],
                    days_61_90=["Double down on the winning motion if signals improve.", "Cut side-channel experiments that do not support the wedge."],
                ),
                risks=["False positives from small-sample demand", "organizational thrash from supporting multiple motions at once"],
                leading_indicators=["segment-specific activation", "sales cycle compression or self-serve conversion", "retention within the chosen wedge"],
            )

        return SynthesisResult(
            recommendation="Make one sharp strategic choice, build around it for 90 days, and reject adjacent opportunities that dilute the learning loop.",
            actions_30_60_90=Actions306090(
                days_0_30=["Name the wedge explicitly.", "Define the user behavior that proves the wedge is working."],
                days_31_60=["Ship against that wedge weekly.", "Review progress against one primary success metric."],
                days_61_90=["Scale the winning path.", "Kill initiatives that do not reinforce the wedge."],
            ),
            risks=["mistaking activity for validated learning", "trying to preserve too many options"],
            leading_indicators=["time to user value", "repeat usage", "decision cycle speed"],
        )

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
                        source_coverage=SourceCoverage(
                            total_chunks_found=0,
                            avg_relevance=0.0,
                            has_direct_coverage=False,
                            coverage_level="none",
                        ),
                        ai_generated_percentage=100,
                    )
                )
            else:
                round_table.append(result)

        round_json = json.dumps([item.model_dump() for item in round_table], ensure_ascii=False)

        clash_data = self.llm.generate_json(
            "You identify core strategic friction from multiple viewpoints.",
            clash_prompt(query, round_json),
            self._fallback_clash(query, round_table).model_dump(),
        )
        clash = ClashResult(**clash_data)

        synthesis_data = self.llm.generate_json(
            "You synthesize strategy into actionable plan.",
            synthesis_prompt(query, round_json, json.dumps(clash.model_dump())),
            self._fallback_synthesis(query, clash).model_dump(),
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

        # Calculate source coverage
        source_coverage = self._calculate_coverage(context_chunks)

        # Build citations with relevance scores
        citations = []
        for chunk in context_chunks[:4]:
            citation = Citation(
                source_id=chunk.citation.source_id,
                title=chunk.citation.title,
                url=chunk.citation.url,
                excerpt=chunk.citation.excerpt,
                framework_tag=chunk.citation.framework_tag,
                relevance_score=round(1.0 - chunk.distance, 2),
            )
            citations.append(citation)

        context = "\n\n".join([f"[Source] {chunk.citation.title}:\n{chunk.text}" for chunk in context_chunks])

        response = await asyncio.to_thread(
            self.llm.generate_text,
            persona_system_prompt(persona_id),
            persona_user_prompt(query, context, persona_id, source_coverage),
        )

        # Estimate AI-generated percentage
        ai_pct = self._estimate_ai_generation(source_coverage)

        return PersonaResponse(
            persona_id=persona_id,
            persona_name=PERSONA_NAMES[persona_id],
            response=response,
            citations=citations,
            source_coverage=source_coverage,
            ai_generated_percentage=ai_pct,
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

    def _calculate_coverage(self, chunks: list) -> SourceCoverage:
        """Calculate source coverage metrics from retrieved chunks."""
        if not chunks:
            return SourceCoverage(
                total_chunks_found=0,
                avg_relevance=0.0,
                has_direct_coverage=False,
                coverage_level="none",
            )

        distances = [c.distance for c in chunks]
        avg_distance = sum(distances) / len(distances)
        avg_relevance = 1.0 - avg_distance

        # Determine coverage level
        if avg_relevance > 0.75 and len(chunks) >= 4:
            level = "high"
        elif avg_relevance > 0.65 or len(chunks) >= 2:
            level = "medium"
        elif avg_relevance > 0.5 or len(chunks) >= 1:
            level = "low"
        else:
            level = "none"

        return SourceCoverage(
            total_chunks_found=len(chunks),
            avg_relevance=round(avg_relevance, 2),
            has_direct_coverage=avg_relevance > 0.7,
            coverage_level=level,
        )

    def _estimate_ai_generation(self, coverage: SourceCoverage) -> int:
        """Estimate percentage of response that's AI-generated vs source-based."""
        if coverage.coverage_level == "high":
            return 20  # 80% source-based
        elif coverage.coverage_level == "medium":
            return 40  # 60% source-based
        elif coverage.coverage_level == "low":
            return 70  # 30% source-based
        else:
            return 95  # 95% AI extrapolation
