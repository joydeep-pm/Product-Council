"use client";

import { Clock3, History, ScanSearch } from "lucide-react";

import { SessionListItem } from "@/types/council";

type Props = {
  items: SessionListItem[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  isLoading: boolean;
};

export function HistorySidebar({ items, selectedId, onSelect, isLoading }: Props) {
  return (
    <aside className="panel h-full rounded-[1.8rem] p-4 lg:p-4.5">
      <div className="mb-4 border-b border-black/10 pb-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg1">
            <History size={14} />
            Session Archive
          </div>
          <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] text-fg1">{items.length}</span>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-[1.25rem] border border-[rgba(196,90,44,0.12)] bg-[rgba(255,255,255,0.62)] p-3 text-[11px] leading-relaxed text-fg1">
          <ScanSearch size={14} className="mt-0.5 shrink-0 text-accent" />
          <span>Reopen any past council to revisit the debate and conclusion.</span>
        </div>
      </div>

      <div className="space-y-1.5 overflow-y-auto pr-1">
        {isLoading && (
          <div className="rounded-xl border border-black/10 bg-white/65 p-3 text-sm text-fg1">Loading history...</div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/20 bg-white/65 p-4 text-sm text-fg1">
            No sessions yet. Run your first council to begin a reusable decision archive.
          </div>
        )}

        {items.map((item) => {
          const selected = item.session_id === selectedId;
          return (
            <button
              key={item.session_id}
              onClick={() => onSelect(item.session_id)}
              className={`w-full rounded-[1.1rem] border px-3 py-2.5 text-left transition ${
                selected
                  ? "border-accent/70 bg-[linear-gradient(180deg,rgba(196,90,44,0.1),rgba(255,247,241,0.84))] shadow-[0_12px_24px_rgba(196,90,44,0.1)]"
                  : "border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,250,244,0.7))] hover:border-black/20 hover:bg-white"
              }`}
            >
              <div className="line-clamp-2 text-[12.5px] font-semibold leading-snug text-fg0">{item.query}</div>
              <div className="mt-1 inline-flex rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-fg1">
                {item.question_count} question{item.question_count !== 1 ? "s" : ""}
              </div>
              {item.friction_summary && (
                <div className="mt-1.5 inline-flex rounded-full border border-[rgba(196,90,44,0.12)] bg-[rgba(196,90,44,0.06)] px-2 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-[#8f451f]">
                  {item.friction_summary}
                </div>
              )}
              {item.synthesis_summary && <div className="mt-1.5 line-clamp-2 text-[10.5px] leading-relaxed text-fg1">{item.synthesis_summary}</div>}
              <div className="mt-1.5 flex items-center gap-1 text-[9.5px] text-fg1">
                <Clock3 size={11} />
                {new Date(item.created_at).toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
