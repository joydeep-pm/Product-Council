"use client";

import { Compass } from "lucide-react";

export function EmptyState() {
  return (
    <section className="panel rounded-3xl p-8 lg:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-3 py-1 text-xs uppercase tracking-[0.18em] text-fg1">
          <Compass size={12} />
          The Strategy Council
        </div>
        <h2 className="mt-4 text-3xl font-semibold leading-tight text-fg0 lg:text-4xl">
          Four specialist perspectives. One clear strategic direction.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-fg1">
          Submit one high-stakes product question. The council runs an asynchronous round table, isolates the central friction,
          and returns a tactical synthesis with actionable 30/60/90 day guidance.
        </p>
      </div>
    </section>
  );
}
