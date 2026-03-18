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
    <section className="panel rounded-[1.8rem] p-5 lg:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-fg1">Council Prompt</div>
          <div className="mt-1 text-sm text-fg1">Frame the decision, constraints, timing, and what failure would look like.</div>
        </div>
        <span className="hidden items-center gap-1 rounded-full border border-[rgba(196,90,44,0.14)] bg-white/70 px-3 py-1 text-xs text-fg1 sm:inline-flex">
          <Sparkles size={12} />
          Debate Engine
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="field w-full resize-y rounded-[1.25rem] p-4 text-[15px] leading-relaxed outline-none"
        placeholder="Example: We are a seed-stage B2B SaaS company with 8 people and 14 months of runway. Should we focus the next two quarters on enterprise expansion, self-serve activation, or workflow depth for our current ICP? Our risk is spreading the team too thin while missing the fastest path to durable revenue."
      />

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs leading-relaxed text-fg1">
          Include team size, runway, target segment, timeline, and downside risk.
          <span className="ml-2 rounded-md border border-black/10 bg-white/65 px-2 py-0.5 font-mono text-[11px]">{trimmed.length} chars</span>
        </div>

        <button
          onClick={onSubmit}
          disabled={isRunning || !trimmed}
          className="inline-flex items-center justify-center gap-2 rounded-[0.95rem] bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_22px_rgba(196,90,44,0.18)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? "Running Council..." : "Run Product Council"}
          {!isRunning && <ArrowRight size={14} />}
        </button>
      </div>
    </section>
  );
}
