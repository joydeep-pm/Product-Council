"use client";

import { FileText, MessagesSquare, ShieldCheck } from "lucide-react";

function Step({
  number,
  title,
  detail,
  icon,
}: {
  number: string;
  title: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(54,31,16,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,249,243,0.68))] p-4 shadow-[0_14px_30px_rgba(76,43,22,0.05)]">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_46%)]" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-[rgba(196,90,44,0.16)] bg-[rgba(196,90,44,0.08)] text-[#8f451f]">
          {icon}
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-fg1">Step {number}</div>
          <div className="mt-1 text-sm font-semibold text-fg0">{title}</div>
        </div>
      </div>
      <div className="relative mt-3 text-xs leading-[1.7] text-fg1">{detail}</div>
    </div>
  );
}

export function QuickStartStrip() {
  return (
    <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
      <Step
        number="1"
        title="Write the brief"
        detail="Start in the prompt box. Describe the decision, your constraints, and what failure would look like."
        icon={<FileText size={16} />}
      />
      <Step
        number="2"
        title="Read the debate"
        detail="The council responds from four distinct perspectives before isolating the true tension."
        icon={<MessagesSquare size={16} />}
      />
      <Step
        number="3"
        title="Act with confidence"
        detail="Use the synthesis, risks, and leading indicators as your operational decision memo."
        icon={<ShieldCheck size={16} />}
      />
    </section>
  );
}
