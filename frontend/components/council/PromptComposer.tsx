"use client";

import { ArrowRight, Sparkles } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isRunning: boolean;
};

export function PromptComposer({ value, onChange, onSubmit, isRunning }: Props) {
  const trimmed = value.trim();

  return (
    <section className="panel rounded-3xl p-5 lg:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-fg1">Council Prompt</div>
          <div className="mt-1 text-sm text-fg1">Frame the context, constraints, and decision you need to make.</div>
        </div>
        <span className="hidden items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs text-fg1 sm:inline-flex">
          <Sparkles size={12} />
          Multi-Agent Debate
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="field w-full resize-y rounded-2xl p-4 text-[15px] leading-relaxed outline-none"
        placeholder="Example: For the next 2 quarters, should we prioritize enterprise sales over self-serve growth? We have a 5-person team, 12 months runway, and must improve net revenue retention."
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-fg1">
          Tip: include budget, team size, timeline, and downside risk.
          <span className="ml-2 rounded-md border border-black/10 bg-white/65 px-2 py-0.5 font-mono text-[11px]">{trimmed.length} chars</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={isRunning || !trimmed}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running Council..." : "Run Council"}
          {!isRunning && <ArrowRight size={14} />}
        </button>
      </div>
    </section>
  );
}
