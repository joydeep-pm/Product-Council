"use client";

import { SynthesisResult } from "@/types/council";

type Props = {
  synthesis: SynthesisResult | null;
  isLoading: boolean;
};

function List({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="mb-2 text-sm uppercase tracking-[0.14em] text-fg1">{title}</h4>
      <ul className="space-y-2 text-sm text-fg1">
        {items.map((item) => (
          <li key={item} className="rounded-lg border border-white/10 bg-bg1/70 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SynthesisPanel({ synthesis, isLoading }: Props) {
  return (
    <section className="panel rounded-2xl p-5 shadow-panel">
      <div className="mb-3 text-sm uppercase tracking-[0.18em] text-fg1">Synthesis</div>
      {isLoading && <div className="text-sm text-fg1">Building final recommendation...</div>}
      {synthesis && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-fg0">{synthesis.recommendation}</h3>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <List title="0-30 Days" items={synthesis.actions_30_60_90.days_0_30} />
            <List title="31-60 Days" items={synthesis.actions_30_60_90.days_31_60} />
            <List title="61-90 Days" items={synthesis.actions_30_60_90.days_61_90} />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <List title="Risks" items={synthesis.risks} />
            <List title="Leading Indicators" items={synthesis.leading_indicators} />
          </div>
        </div>
      )}
    </section>
  );
}
