"use client";

import { ClashResult } from "@/types/council";

type Props = {
  clash: ClashResult | null;
  isLoading: boolean;
};

export function ClashPanel({ clash, isLoading }: Props) {
  return (
    <section className="panel rounded-2xl p-5 shadow-panel">
      <div className="mb-3 text-sm uppercase tracking-[0.18em] text-fg1">Clash</div>
      {isLoading && <div className="text-sm text-fg1">Resolving central friction...</div>}
      {clash && (
        <>
          <h3 className="text-lg font-semibold text-fg0">{clash.friction_point}</h3>
          <p className="mt-2 text-sm text-fg1">{clash.why_it_matters}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {clash.tradeoff_axes.map((axis) => (
              <span key={axis} className="badge rounded-full px-3 py-1 text-xs uppercase tracking-[0.12em]">
                {axis}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
