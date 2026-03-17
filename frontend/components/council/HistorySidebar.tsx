"use client";

import { Clock3, History } from "lucide-react";

import { SessionListItem } from "@/types/council";

type Props = {
  items: SessionListItem[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  isLoading: boolean;
};

export function HistorySidebar({ items, selectedId, onSelect, isLoading }: Props) {
  return (
    <aside className="panel h-full rounded-3xl p-4 lg:p-5">
      <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
        <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-fg1">
          <History size={14} />
          Session History
        </div>
        <span className="rounded-full border border-black/10 bg-white/70 px-2 py-0.5 text-[11px] text-fg1">{items.length}</span>
      </div>

      <div className="space-y-2.5 overflow-y-auto pr-1">
        {isLoading && (
          <div className="rounded-xl border border-black/10 bg-white/65 p-3 text-sm text-fg1">Loading history...</div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="rounded-xl border border-dashed border-black/20 bg-white/65 p-4 text-sm text-fg1">
            No sessions yet. Run your first council to build a decision record.
          </div>
        )}

        {items.map((item) => {
          const selected = item.session_id === selectedId;
          return (
            <button
              key={item.session_id}
              onClick={() => onSelect(item.session_id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-accent bg-[rgba(196,90,44,0.12)] shadow-[0_6px_16px_rgba(196,90,44,0.12)]"
                  : "border-black/10 bg-white/75 hover:border-black/20 hover:bg-white"
              }`}
            >
              <div className="line-clamp-2 text-sm font-semibold leading-snug text-fg0">{item.query}</div>
              {item.synthesis_summary && <div className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-fg1">{item.synthesis_summary}</div>}
              <div className="mt-2 flex items-center gap-1 text-[11px] text-fg1">
                <Clock3 size={12} />
                {new Date(item.created_at).toLocaleString()}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
