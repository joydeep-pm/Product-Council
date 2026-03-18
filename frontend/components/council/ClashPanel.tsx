"use client";

import { Flame } from "lucide-react";

import { ClashResult } from "@/types/council";

type Props = {
  clash: ClashResult | null;
  isLoading: boolean;
};

export function ClashPanel({ clash, isLoading }: Props) {
  return (
    <section className="panel rounded-[1.8rem] p-5 lg:p-5">
      <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-fg1">
        <Flame size={13} className="text-accent" />
        Clash
      </div>
      {isLoading && <div className="text-sm text-fg1">Resolving central friction...</div>}

      {clash && (
        <>
          <h3 className="max-w-3xl text-[1.35rem] font-semibold leading-[1.14] tracking-[-0.03em] text-fg0 lg:text-[1.55rem]">
            {clash.friction_point}
          </h3>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.75] text-fg1">{clash.why_it_matters}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {clash.tradeoff_axes.map((axis) => (
              <span key={axis} className="badge rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em]">
                {axis}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
