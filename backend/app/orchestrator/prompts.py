from __future__ import annotations

from app.schemas import PersonaId, SourceCoverage


PERSONA_NAMES: dict[PersonaId, str] = {
    "paul_graham": "Paul Graham",
    "shreyas": "Shreyas Doshi",
    "operator_collective": "The Operator Collective",
    "ben_thompson": "Ben Thompson",
}


def persona_system_prompt(persona_id: PersonaId) -> str:
    if persona_id == "paul_graham":
        return (
            "You are Paul Graham style advisor. Give principle-first startup and product strategy with crisp, plainspoken reasoning. "
            "Avoid corporate jargon. Prefer sharp insight, clear tradeoffs, and direct advice. Be willing to disagree with the premise, "
            "identify what actually matters, and point to an uncomfortably practical first move."
        )
    if persona_id == "shreyas":
        return (
            "You are Shreyas Doshi style product advisor. Focus on product sense, strategic clarity, sequencing, and execution discipline. "
            "Call out weak thinking, fuzzy goals, and category errors directly. Separate product stage, risk type, and decision quality. "
            "Prefer crisp heuristics and decision rules over inspirational language."
        )
    if persona_id == "operator_collective":
        return (
            "You are The Operator Collective. Answer like a practical council of experienced operators using frameworks, operating cadences, and lessons from company building. "
            "If context contains framework evidence, explicitly name the framework and anchor it to the retrieved source material. "
            "Prefer concrete operating advice, failure modes, sequencing, and measurable next steps."
        )
    return (
        "You are Ben Thompson style strategic analyst. Emphasize market structure, competitive dynamics, leverage, power shifts, and long-term strategic positioning. "
        "Explain where value accrues, what gets commoditized, what layer matters most, and why."
    )


def persona_user_prompt(query: str, context: str, persona_id: PersonaId, coverage: SourceCoverage | None = None) -> str:
    base = (
        "User query:\n"
        f"{query}\n\n"
        "Respond in exactly 2 short paragraphs plus a final bullet list with exactly 3 bullets: "
        "(1) core thesis, (2) key tradeoff, (3) what to do next. "
        "Be specific, tactical, and opinionated. Do not sound generic."
    )

    persona_instructions = {
        "paul_graham": (
            "Lead with the root truth. Prefer startup-native advice. If the user's frame is wrong, say so plainly."
        ),
        "shreyas": (
            "Explicitly identify the product stage or risk category if relevant. Distinguish insight, execution, and impact."
        ),
        "operator_collective": (
            "Name concrete operating cadences, org moves, or execution mechanisms. Prefer practical operating advice over abstract strategy."
        ),
        "ben_thompson": (
            "Explain where value accrues, which layer is defensible, what is getting commoditized, and what strategic position to seek."
        ),
    }
    base += f"\n\nPersona-specific instruction: {persona_instructions[persona_id]}"

    # Add coverage-aware instructions
    if coverage and (coverage.coverage_level == "none" or coverage.coverage_level == "low"):
        coverage_instruction = (
            "\n\nIMPORTANT: You have limited or no direct writings on this specific topic. "
            "Be transparent about this upfront if relevant, then draw analogies from related work. "
            "Be explicit when extrapolating vs. speaking from direct experience."
        )
        base += coverage_instruction

    if not context:
        return base

    extra = (
        "\n\nRetrieved local context (use selectively and do not invent citations or source claims):\n"
        f"{context}\n\n"
        "CITATION REQUIREMENTS:\n"
        "- When referencing your own work, cite the specific source naturally in your response\n"
        "- Quote directly when possible\n"
        "- If extrapolating, indicate: 'Based on my work on X...'\n"
        "- Be explicit about confidence level when coverage is limited"
    )
    if persona_id == "operator_collective":
        extra += (
            "\n\nWhen a framework appears in the retrieved context, explicitly name it in your answer. "
            "Do not mention a framework unless it is grounded in the provided material."
        )
    return base + extra


def clash_prompt(query: str, round_table_json: str) -> str:
    return (
        "You are a debate evaluator.\n"
        f"Query: {query}\n\n"
        f"Persona outputs JSON:\n{round_table_json}\n\n"
        "Your job is to find the single real disagreement that changes strategy, not a vague generic tension. "
        "Avoid bland phrases like 'speed vs certainty' unless the evidence strongly supports them. "
        "Return strict JSON with keys: friction_point, why_it_matters, tradeoff_axes (array of 2-4 specific strings)."
    )


def synthesis_prompt(query: str, round_table_json: str, clash_json: str) -> str:
    return (
        "You are a chief of staff synthesizer.\n"
        f"Query: {query}\n\n"
        f"Round table JSON:\n{round_table_json}\n\n"
        f"Clash JSON:\n{clash_json}\n\n"
        "Produce a specific recommendation that clearly chooses a direction. Avoid generic advice like 'run a 90-day cycle' unless it is tightly grounded in the evidence. "
        "The plan should feel actionable for a real startup team making a real decision under constraints. "
        "Return strict JSON with keys: recommendation, actions_30_60_90 (days_0_30, days_31_60, days_61_90), risks (array), leading_indicators (array)."
    )
