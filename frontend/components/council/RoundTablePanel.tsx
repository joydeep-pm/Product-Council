"use client";

import { PersonaResponse } from "@/types/council";

const PERSONA_THEME: Record<
  string,
  { border: string; bg: string; badge: string; initials: string }
> = {
  paul_graham: {
    border: "border-[rgba(187,109,72,0.38)]",
    bg: "bg-[rgba(255,247,241,0.8)]",
    badge: "bg-[rgba(187,109,72,0.16)] text-[#7b3d22]",
    initials: "PG",
  },
  shreyas: {
    border: "border-[rgba(120,129,143,0.38)]",
    bg: "bg-[rgba(248,249,251,0.88)]",
    badge: "bg-[rgba(120,129,143,0.15)] text-[#404a57]",
    initials: "SD",
  },
  operator_collective: {
    border: "border-[rgba(109,133,96,0.35)]",
    bg: "bg-[rgba(244,248,242,0.86)]",
    badge: "bg-[rgba(109,133,96,0.16)] text-[#375038]",
    initials: "OC",
  },
  ben_thompson: {
    border: "border-[rgba(118,102,87,0.35)]",
    bg: "bg-[rgba(249,246,243,0.88)]",
    badge: "bg-[rgba(118,102,87,0.15)] text-[#4c4036]",
    initials: "BT",
  },
};

type Props = {
  entries: PersonaResponse[];
  isLoading: boolean;
};

export function RoundTablePanel({ entries, isLoading }: Props) {
  return (
    <section className="panel rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-fg1">Round Table</div>
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-fg1">
          {entries.length} personas
        </span>
      </div>

      {isLoading && <div className="text-sm text-fg1">Generating persona responses...</div>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {entries.map((entry) => {
          const theme = PERSONA_THEME[entry.persona_id] ?? PERSONA_THEME.paul_graham;
          return (
            <article key={entry.persona_id} className={`rounded-2xl border p-4 ${theme.border} ${theme.bg}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${theme.badge}`}>
                  {theme.initials}
                </span>
                <div className="text-sm font-semibold text-fg0">{entry.persona_name}</div>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg1">{entry.response}</p>

              {entry.citations.length > 0 && (
                <div className="mt-4 border-t border-black/10 pt-3">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.18em] text-fg1">Citations</div>
                  <div className="space-y-2">
                    {entry.citations.map((citation, index) => (
                      <a
                        key={`${citation.source_id}-${index}`}
                        href={citation.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-black/10 bg-white/70 px-2.5 py-1.5 text-xs text-fg1 hover:border-black/20 hover:text-fg0"
                      >
                        <div className="font-medium">
                          [{index + 1}] {citation.title}
                        </div>
                        {citation.framework_tag && (
                          <div className="mt-0.5 inline-flex rounded-md border border-black/10 bg-black/5 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                            {citation.framework_tag}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
