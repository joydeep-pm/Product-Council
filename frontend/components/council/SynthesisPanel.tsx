"use client";

import { ArrowUpRight, ShieldAlert, TimerReset, TrendingUp } from "lucide-react";

import { SynthesisResult } from "@/types/council";

type Props = {
  synthesis: SynthesisResult | null;
  isLoading: boolean;
};

function List({ title, items, icon }: { title: string; items: string[]; icon?: React.ReactNode }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-fg1">
        {icon}
        {title}
      </h4>
      <ul className="space-y-2 text-sm text-fg1">
        {items.map((item) => (
          <li key={item} className="rounded-[0.95rem] border border-black/10 bg-white/75 px-3 py-2 leading-relaxed shadow-[0_6px_14px_rgba(76,43,22,0.035)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SynthesisPanel({ synthesis, isLoading }: Props) {
  return (
    <section className="panel rounded-[1.8rem] p-5 lg:p-5">
      <div className="mb-3 text-[11px] uppercase tracking-[0.2em] text-fg1">Synthesis</div>
      {isLoading && <div className="text-sm text-fg1">Building final recommendation...</div>}

      {synthesis && (
        <div className="space-y-5">
          <div className="rounded-[1.3rem] border border-[rgba(196,90,44,0.16)] bg-[linear-gradient(135deg,rgba(196,90,44,0.08),rgba(255,255,255,0.58))] p-4 lg:p-5">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[rgba(196,90,44,0.14)] bg-white/72 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[#8f451f]">
              <ArrowUpRight size={12} />
              Recommendation
            </div>
            <h3 className="max-w-4xl text-[1.4rem] font-semibold leading-[1.18] tracking-[-0.03em] text-fg0 lg:text-[1.65rem]">
              {synthesis.recommendation}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <List title="0-30 Days" items={synthesis.actions_30_60_90.days_0_30} icon={<TimerReset size={12} />} />
            <List title="31-60 Days" items={synthesis.actions_30_60_90.days_31_60} icon={<TimerReset size={12} />} />
            <List title="61-90 Days" items={synthesis.actions_30_60_90.days_61_90} icon={<TimerReset size={12} />} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <List title="Risks" items={synthesis.risks} icon={<ShieldAlert size={12} />} />
            <List title="Leading Indicators" items={synthesis.leading_indicators} icon={<TrendingUp size={12} />} />
          </div>
        </div>
      )}
    </section>
  );
}
