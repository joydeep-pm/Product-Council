"use client";

import { Clock3 } from "lucide-react";

import { SessionListItem } from "@/types/council";

type Props = {
  items: SessionListItem[];
  selectedId: string | null;
  onSelect: (sessionId: string) => void;
  isLoading: boolean;
};

export function HistorySidebar({ items, selectedId, onSelect, isLoading }: Props) {
  return (
    <aside className="panel h-full rounded-2xl p-4 shadow-panel">
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-fg1">
        <Clock3 size={14} />
        Session History
      </div>

      <div className="space-y-2 overflow-y-auto pr-1">
        {isLoading && <div className="text-sm text-fg1">Loading history...</div>}
        {!isLoading && items.length === 0 && <div className="text-sm text-fg1">No sessions yet.</div>}
        {items.map((item) => {
          const selected = item.session_id === selectedId;
          return (
            <button
              key={item.session_id}
              onClick={() => onSelect(item.session_id)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                selected ? "border-accent bg-accent/10" : "border-white/10 bg-bg1/60 hover:border-white/20"
              }`}
            >
              <div className="line-clamp-2 text-sm font-medium text-fg0">{item.query}</div>
              <div className="mt-2 text-xs text-fg1">{new Date(item.created_at).toLocaleString()}</div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
