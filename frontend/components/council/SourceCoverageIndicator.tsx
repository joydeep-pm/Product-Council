"use client";

import { SourceCoverage } from "@/types/council";

interface Props {
  coverage: SourceCoverage;
  aiGeneratedPct: number;
  personaName: string;
}

export function SourceCoverageIndicator({ coverage, aiGeneratedPct, personaName }: Props) {
  const levelConfig = {
    high: {
      icon: "🟢",
      label: "High source coverage",
      description: `${personaName} has written extensively about this`,
      bgColor: "bg-green-50/80",
      borderColor: "border-green-200/40",
      textColor: "text-green-900",
    },
    medium: {
      icon: "🟡",
      label: "Moderate source coverage",
      description: `${personaName} has touched on this topic`,
      bgColor: "bg-yellow-50/80",
      borderColor: "border-yellow-200/40",
      textColor: "text-yellow-900",
    },
    low: {
      icon: "🟠",
      label: "Limited source coverage",
      description: `${personaName} hasn't written much about this specifically`,
      bgColor: "bg-orange-50/80",
      borderColor: "border-orange-200/40",
      textColor: "text-orange-900",
    },
    none: {
      icon: "🔴",
      label: "No direct sources",
      description: `${personaName} hasn't written about this topic`,
      bgColor: "bg-red-50/80",
      borderColor: "border-red-200/40",
      textColor: "text-red-900",
    },
  };

  const config = levelConfig[coverage.coverage_level];

  return (
    <div
      className={`mb-3 rounded-lg border px-3 py-2 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{config.icon}</span>
          <div>
            <div className={`text-[10px] font-medium uppercase tracking-wider ${config.textColor}`}>
              {config.label}
            </div>
            <div className="text-[11px] text-fg1">{config.description}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="text-[10px] text-fg1">
            {coverage.total_chunks_found} source{coverage.total_chunks_found !== 1 ? "s" : ""}
          </div>
          <div className="text-[10px] font-medium text-fg1">~{aiGeneratedPct}% AI-generated</div>
        </div>
      </div>
    </div>
  );
}
