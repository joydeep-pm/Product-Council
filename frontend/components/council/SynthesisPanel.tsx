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
      <h4 className="mb-2 text-[11px] uppercase tracking-[0.16em] text-fg1">{title}</h4>
      <ul className="space-y-2 text-sm text-fg1">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-black/10 bg-white/75 px-3 py-2 leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SynthesisPanel({ synthesis, isLoading }: Props) {
  return (
    <section className="panel rounded-3xl p-5 lg:p-6">
      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-fg1">Synthesis</div>
      {isLoading && <div className="text-sm text-fg1">Building final recommendation...</div>}

      {synthesis && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold leading-tight text-fg0">{synthesis.recommendation}</h3>
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
