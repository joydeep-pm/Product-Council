"use client";

import { BookOpenText, BrainCircuit, Quote, ShieldAlert, TrendingUp } from "lucide-react";

import { CouncilSession } from "@/types/council";

type Props = {
  session: CouncilSession | null;
};

function RailBlock({
  label,
  title,
  children,
  icon,
  featured = false,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-[1.45rem] border p-4 shadow-[0_12px_26px_rgba(76,43,22,0.05)] backdrop-blur-md ${
        featured
          ? "border-[rgba(196,90,44,0.16)] bg-[linear-gradient(180deg,rgba(255,251,247,0.86),rgba(248,237,227,0.74))]"
          : "border-[rgba(54,31,16,0.09)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,250,244,0.66))]"
      }`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),transparent_46%)]" />
      <div className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-fg1">
        <span className="flex h-8 w-8 items-center justify-center rounded-[0.9rem] border border-[rgba(196,90,44,0.16)] bg-[linear-gradient(180deg,rgba(196,90,44,0.12),rgba(196,90,44,0.05))] text-[#8f451f] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {icon}
        </span>
        {label}
      </div>
      <div className="relative mt-2.5 text-base font-semibold leading-[1.3] tracking-[-0.02em] text-fg0">{title}</div>
      <div className="relative mt-2.5 text-[13px] leading-[1.7] text-fg1">{children}</div>
    </section>
  );
}

export function CouncilRail({ session }: Props) {
  const topFrameworks = Array.from(
    new Set(
      session?.round_table
        .flatMap((persona) => persona.citations)
        .map((citation) => citation.framework_tag)
        .filter((tag): tag is string => Boolean(tag)) ?? [],
    ),
  ).slice(0, 4);

  const recommendation = session?.synthesis.recommendation;
  const friction = session?.clash.friction_point;
  const risks = session?.synthesis.risks ?? [];
  const indicators = session?.synthesis.leading_indicators ?? [];

  return (
    <div className="space-y-3.5">
      <RailBlock
        label="Council Read"
        title={recommendation ? "Unified recommendation" : "How to use this room"}
        icon={<BrainCircuit size={14} />}
        featured
      >
        {recommendation ??
          "Start with one decision question, add context and constraints, and let the council challenge your framing before you commit resources."}
      </RailBlock>

      <RailBlock label="Core Tension" title={friction ?? "Strategic friction appears here"} icon={<Quote size={14} />}>
        {session?.clash.why_it_matters ??
          "After the viewpoints are generated, the system isolates the disagreement that actually matters for execution."}
      </RailBlock>

      <RailBlock
        label="Frameworks"
        title={topFrameworks.length ? "Referenced operating lenses" : "Framework-backed when available"}
        icon={<BookOpenText size={14} />}
      >
        {topFrameworks.length ? (
          <div className="flex flex-wrap gap-2">
            {topFrameworks.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[rgba(196,90,44,0.16)] bg-[rgba(196,90,44,0.08)] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#8f451f]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : (
          "Named frameworks appear here when citations support them."
        )}
      </RailBlock>

      <RailBlock label="Risk Watch" title={risks.length ? `${risks.length} execution risks` : "Execution risks appear here"} icon={<ShieldAlert size={14} />}>
        {risks.length ? (
          <ul className="space-y-2">
            {risks.slice(0, 3).map((risk) => (
              <li key={risk} className="rounded-[0.95rem] border border-black/8 bg-white/65 px-3 py-2 text-[13px] shadow-[0_6px_14px_rgba(76,43,22,0.035)]">
                {risk}
              </li>
            ))}
          </ul>
        ) : (
          "The final synthesis isolates the principal failure modes so the output is operationally useful."
        )}
      </RailBlock>

      <RailBlock label="Signals" title={indicators.length ? "What to measure next" : "Leading indicators appear here"} icon={<TrendingUp size={14} />}>
        {indicators.length ? (
          <ul className="space-y-2">
            {indicators.slice(0, 3).map((item) => (
              <li key={item} className="rounded-[0.95rem] border border-black/8 bg-white/65 px-3 py-2 text-[13px] shadow-[0_6px_14px_rgba(76,43,22,0.035)]">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          "The council converts opinion into measurable indicators so you can tell whether the recommendation is working."
        )}
      </RailBlock>
    </div>
  );
}
