"use client";

import { Layers3, LibraryBig, MessageSquareQuote, Target } from "lucide-react";

import { CouncilSession } from "@/types/council";

type Props = {
  session: CouncilSession | null;
  historyCount: number;
};

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-[rgba(47,30,18,0.09)] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(255,248,242,0.72))] p-4 shadow-[0_14px_28px_rgba(78,44,23,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(78,44,23,0.08)]">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.16),transparent_42%)] opacity-80" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-fg1">{label}</div>
          <div className="mt-2 text-[1.4rem] font-semibold tracking-[-0.05em] text-fg0">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] border border-[rgba(196,90,44,0.16)] bg-[linear-gradient(180deg,rgba(196,90,44,0.12),rgba(196,90,44,0.05))] text-[#8f451f] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
          {icon}
        </div>
      </div>
      <div className="relative mt-3 max-w-[22rem] text-xs leading-[1.65] text-fg1">{hint}</div>
    </div>
  );
}

export function OverviewStrip({ session, historyCount }: Props) {
  const citationCount = session?.round_table.reduce((sum, persona) => sum + persona.citations.length, 0) ?? 0;
  const tradeoffCount = session?.clash.tradeoff_axes.length ?? 0;
  const actionCount = session
    ? session.synthesis.actions_30_60_90.days_0_30.length +
      session.synthesis.actions_30_60_90.days_31_60.length +
      session.synthesis.actions_30_60_90.days_61_90.length
    : 0;

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
      <StatCard
        label="Session"
        value={session ? `${session.turns.length} question${session.turns.length !== 1 ? "s" : ""}` : "Write 1 brief"}
        hint="Start with one sharp brief, then ask follow-up questions without losing the original context."
        icon={<MessageSquareQuote size={18} />}
      />
      <StatCard
        label="Sessions"
        value={String(historyCount)}
        hint="Every debate is preserved as a durable decision record with a unique session identifier."
        icon={<Layers3 size={18} />}
      />
      <StatCard
        label="Evidence"
        value={session ? `${citationCount} citations` : "RAG-ready"}
        hint="Retrieved local knowledge grounds Shreyas, Operator Collective, and Stratechery-backed reasoning."
        icon={<LibraryBig size={18} />}
      />
      <StatCard
        label="Decision"
        value={session ? `${tradeoffCount} tensions · ${actionCount} actions` : "30 / 60 / 90"}
        hint="Outputs resolve disagreement into one recommendation, concrete risks, measurable signals, and action."
        icon={<Target size={18} />}
      />
    </section>
  );
}
