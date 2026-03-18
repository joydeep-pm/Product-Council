"use client";

import { Compass, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <section className="panel relative overflow-hidden rounded-[1.8rem] p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(196,90,44,0.12),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
      <div className="relative max-w-3xl text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(196,90,44,0.14)] bg-white/78 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-fg1">
          <Compass size={12} />
          Product Council
        </div>
        <h2 className="mt-4 text-[1.7rem] font-semibold leading-[1.08] tracking-[-0.04em] text-fg0 lg:text-[2.05rem]">
          Four distinct product minds. One decision-ready answer.
        </h2>
        <p className="mt-3 max-w-2xl text-[14px] leading-[1.75] text-fg1">
          Submit a brief and the council debates from four angles, identifies the real point of tension, and returns a recommendation you can use as a working decision memo.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-fg1">
          <Sparkles size={12} />
          Local knowledge + strategic synthesis
        </div>
      </div>
    </section>
  );
}
