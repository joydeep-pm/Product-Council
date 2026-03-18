"use client";

import { LoaderCircle } from "lucide-react";

export function LoadingState() {
  return (
    <div className="panel rounded-[1.4rem] p-4 text-sm text-fg1">
      <div className="flex items-center gap-3">
        <LoaderCircle size={16} className="animate-spin text-accent" />
        <div>
          <div className="font-medium text-fg0">Running Product Council</div>
          <div className="mt-1 text-[13px] leading-relaxed text-fg1">
            Generating viewpoints, isolating the core disagreement, and preparing a tactical synthesis...
          </div>
        </div>
      </div>
    </div>
  );
}
