"use client";

import { PersonaResponse } from "@/types/council";

const PERSONA_TONES: Record<string, string> = {
  paul_graham: "border-amber-500/30",
  shreyas: "border-cyan-500/30",
  operator_collective: "border-emerald-500/30",
  ben_thompson: "border-rose-500/30",
};

type Props = {
  entries: PersonaResponse[];
  isLoading: boolean;
};

export function RoundTablePanel({ entries, isLoading }: Props) {
  return (
    <section className="panel rounded-2xl p-5 shadow-panel">
      <div className="mb-4 text-sm uppercase tracking-[0.18em] text-fg1">Round Table</div>
      {isLoading && <div className="text-sm text-fg1">Generating persona responses...</div>}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {entries.map((entry) => (
          <article key={entry.persona_id} className={`rounded-xl border bg-bg1/70 p-4 ${PERSONA_TONES[entry.persona_id]}`}>
            <div className="mb-2 text-sm font-semibold text-fg0">{entry.persona_name}</div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg1">{entry.response}</p>
            {entry.citations.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="mb-2 text-xs uppercase tracking-[0.14em] text-fg1">Citations</div>
                <div className="space-y-2">
                  {entry.citations.map((citation, index) => (
                    <a key={`${citation.source_id}-${index}`} href={citation.url} target="_blank" className="block text-xs text-fg1 hover:text-fg0">
                      [{index + 1}] {citation.title}
                      {citation.framework_tag ? ` (${citation.framework_tag})` : ""}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
