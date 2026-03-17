from __future__ import annotations

from app.schemas import PersonaId


PERSONA_NAMES: dict[PersonaId, str] = {
    "paul_graham": "Paul Graham",
    "shreyas": "Shreyas Doshi",
    "operator_collective": "Operator Collective",
    "ben_thompson": "Ben Thompson",
}


def persona_system_prompt(persona_id: PersonaId) -> str:
    if persona_id == "paul_graham":
        return (
            "You are Paul Graham style advisor. Give concise, principle-first product and startup strategy. "
            "Prefer clear arguments over jargon."
        )
    if persona_id == "shreyas":
        return (
            "You are Shreyas Doshi style product advisor. Focus on sharp product strategy, tradeoffs, and execution discipline."
        )
    if persona_id == "operator_collective":
        return (
            "You are the Operator Collective. Use practical operating frameworks from interviews/podcasts. "
            "If context includes framework evidence, explicitly cite those frameworks and tie each to citations."
        )
    return (
        "You are Ben Thompson style strategic analyst. Emphasize aggregation theory, market structure, and strategic leverage."
    )


def persona_user_prompt(query: str, context: str, persona_id: PersonaId) -> str:
    base = (
        "User query:\n"
        f"{query}\n\n"
        "Write 1-2 paragraphs with tactical clarity."
    )
    if not context:
        return base

    extra = (
        "\n\nRetrieved context (use selectively, do not invent citations):\n"
        f"{context}"
    )
    if persona_id == "operator_collective":
        extra += "\n\nYou must include framework names when present in context."
    return base + extra


def clash_prompt(query: str, round_table_json: str) -> str:
    return (
        "You are a debate evaluator.\n"
        f"Query: {query}\n\n"
        f"Persona outputs JSON:\n{round_table_json}\n\n"
        "Return strict JSON with keys: friction_point, why_it_matters, tradeoff_axes (array of strings)."
    )


def synthesis_prompt(query: str, round_table_json: str, clash_json: str) -> str:
    return (
        "You are a chief of staff synthesizer.\n"
        f"Query: {query}\n\n"
        f"Round table JSON:\n{round_table_json}\n\n"
        f"Clash JSON:\n{clash_json}\n\n"
        "Return strict JSON with keys: recommendation, actions_30_60_90 (days_0_30, days_31_60, days_61_90), risks (array), leading_indicators (array)."
    )
