"use client";

import { PersonaResponse } from "@/types/council";
import { SourceCoverageIndicator } from "./SourceCoverageIndicator";
import { CitationCard } from "./CitationCard";

const PERSONA_THEME: Record<
  string,
  { border: string; bg: string; badge: string; initials: string; line: string }
> = {
  paul_graham: {
    border: "border-[rgba(187,109,72,0.28)]",
    bg: "bg-[linear-gradient(180deg,rgba(255,247,241,0.92),rgba(255,251,247,0.76))]",
    badge: "bg-[rgba(187,109,72,0.14)] text-[#7b3d22]",
    initials: "PG",
    line: "bg-[rgba(187,109,72,0.64)]",
  },
  shreyas: {
    border: "border-[rgba(120,129,143,0.28)]",
    bg: "bg-[linear-gradient(180deg,rgba(248,249,251,0.94),rgba(255,255,255,0.82))]",
    badge: "bg-[rgba(120,129,143,0.14)] text-[#404a57]",
    initials: "SD",
    line: "bg-[rgba(120,129,143,0.7)]",
  },
  operator_collective: {
    border: "border-[rgba(109,133,96,0.28)]",
    bg: "bg-[linear-gradient(180deg,rgba(244,248,242,0.94),rgba(251,253,250,0.82))]",
    badge: "bg-[rgba(109,133,96,0.14)] text-[#375038]",
    initials: "OC",
    line: "bg-[rgba(109,133,96,0.72)]",
  },
  ben_thompson: {
    border: "border-[rgba(118,102,87,0.28)]",
    bg: "bg-[linear-gradient(180deg,rgba(249,246,243,0.94),rgba(255,252,249,0.82))]",
    badge: "bg-[rgba(118,102,87,0.14)] text-[#4c4036]",
    initials: "BT",
    line: "bg-[rgba(118,102,87,0.68)]",
  },
};

type Props = {
  entries: PersonaResponse[];
  isLoading: boolean;
};

export function RoundTablePanel({ entries, isLoading }: Props) {
  return (
    <section className="panel rounded-[1.8rem] p-5 lg:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-fg1">Round Table</div>
          <div className="mt-1 text-sm text-fg1">Independent viewpoints generated in parallel before synthesis.</div>
        </div>
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-fg1">
          {entries.length} personas
        </span>
      </div>

      {isLoading && <div className="text-sm text-fg1">Generating persona responses...</div>}

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {entries.map((entry) => {
          const theme = PERSONA_THEME[entry.persona_id] ?? PERSONA_THEME.paul_graham;
          return (
            <article
              key={entry.persona_id}
              className={`relative overflow-hidden rounded-[1.3rem] border p-4 shadow-[0_12px_24px_rgba(76,43,22,0.04)] ${theme.border} ${theme.bg}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 ${theme.line}`} />
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${theme.badge}`}>
                  {theme.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold text-fg0">{entry.persona_name}</div>
                  <div className="text-[10px] uppercase tracking-[0.14em] text-fg1">Council perspective</div>
                </div>
              </div>

              {/* Source Coverage Indicator */}
              {entry.source_coverage && (
                <SourceCoverageIndicator
                  coverage={entry.source_coverage}
                  aiGeneratedPct={entry.ai_generated_percentage}
                  personaName={entry.persona_name}
                />
              )}

              <p className="whitespace-pre-wrap text-[13px] leading-[1.75] text-fg1">{entry.response}</p>

              {entry.citations.length > 0 && (
                <div className="mt-4 border-t border-black/10 pt-3">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-fg1">
                    Evidence ({entry.citations.length} source{entry.citations.length !== 1 ? "s" : ""})
                  </div>
                  <div className="space-y-2">
                    {entry.citations.map((citation, index) => (
                      <CitationCard
                        key={`${citation.source_id}-${index}`}
                        citation={citation}
                        index={index + 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Show message when no sources */}
              {entry.citations.length === 0 && entry.source_coverage?.coverage_level === "none" && (
                <div className="mt-4 rounded-lg border border-amber-200/40 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-900">
                  ⚠️ This perspective is based on general principles, not specific writings by {entry.persona_name}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
