"use client";

import { ClashResult } from "@/types/council";

type Props = {
  clash: ClashResult | null;
  isLoading: boolean;
};

export function ClashPanel({ clash, isLoading }: Props) {
  return (
    <section className="panel rounded-3xl p-5 lg:p-6">
      <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-fg1">Clash</div>
      {isLoading && <div className="text-sm text-fg1">Resolving central friction...</div>}

      {clash && (
        <>
          <h3 className="text-lg font-semibold leading-snug text-fg0 lg:text-xl">{clash.friction_point}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg1 lg:text-[15px]">{clash.why_it_matters}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {clash.tradeoff_axes.map((axis) => (
              <span key={axis} className="badge rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.14em]">
                {axis}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
