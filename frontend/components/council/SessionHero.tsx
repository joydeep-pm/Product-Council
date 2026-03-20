"use client";

import { ArrowUpRight, Clock3, MessageSquareText, Orbit, Sparkles } from "lucide-react";

import { CouncilSession } from "@/types/council";

type Props = {
  session: CouncilSession | null;
};

function DetailCard({
  label,
  copy,
  icon,
}: {
  label: string;
  copy: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.4rem] border border-[rgba(75,44,24,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,247,241,0.52))] p-4 shadow-[0_14px_32px_rgba(77,44,22,0.05)] backdrop-blur-md">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.16),transparent_45%)]" />
      <div className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-fg1">
        {icon}
        {label}
      </div>
      <div className="relative mt-2.5 text-[0.95rem] font-medium leading-[1.45] text-fg0">{copy}</div>
    </div>
  );
}

export function SessionHero({ session }: Props) {
  const eyebrow = session ? "Current council brief" : "Private advisory chamber";
  const latestTurn = session?.turns?.[session.turns.length - 1] ?? null;
  const isFollowUp = !!session && !!latestTurn && latestTurn.question !== session.query;

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-[rgba(54,31,16,0.1)] bg-[linear-gradient(135deg,rgba(255,252,248,0.94),rgba(247,236,226,0.82)_48%,rgba(241,225,213,0.78))] p-5 shadow-[0_24px_80px_rgba(73,41,20,0.08)] sm:p-6 lg:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(196,90,44,0.18),transparent_28%),radial-gradient(circle_at_90%_18%,rgba(255,255,255,0.38),transparent_24%),radial-gradient(circle_at_80%_100%,rgba(196,90,44,0.12),transparent_28%)]" />
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full border border-white/20 bg-[radial-gradient(circle,rgba(255,255,255,0.26),rgba(255,255,255,0.02)_62%,transparent)] blur-2xl" />
      <div className="pointer-events-none absolute bottom-[-5rem] left-[24%] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(196,90,44,0.12),transparent_68%)] blur-2xl" />

      <div className="relative space-y-6">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(196,90,44,0.16)] bg-[rgba(255,255,255,0.72)] px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-fg1 backdrop-blur-md">
            <Orbit size={13} />
            {eyebrow}
          </div>

          <div className="mt-5">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[rgba(93,77,65,0.78)]">Product Council</div>
            <h2 className="mt-3 max-w-4xl text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.055em] text-fg0 sm:text-[2.8rem] lg:text-[3.6rem] xl:text-[4.15rem]">
              {session ? session.query : "A private strategy room for consequential product decisions."}
            </h2>
          </div>

          <div className="mt-4 max-w-3xl border-l border-[rgba(196,90,44,0.24)] pl-4 text-[14px] leading-[1.8] text-[rgba(64,48,38,0.88)] lg:text-[0.98rem]">
            {session
              ? "This hero anchors the original brief. Follow-up questions update the analysis below without replacing the core decision context."
              : "Start in the prompt box below. Write one consequential product question, include context and constraints, and let the council stress-test your framing before you commit resources."}
          </div>
        </div>

        {session && latestTurn && (
          <div className="rounded-[1.5rem] border border-[rgba(54,31,16,0.09)] bg-white/62 p-4 shadow-[0_10px_24px_rgba(76,43,22,0.05)] backdrop-blur-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-fg1">
                  <MessageSquareText size={12} />
                  {isFollowUp ? "Latest follow-up question" : "Current question"}
                </div>
                <div className="text-[1rem] leading-[1.7] text-fg0">{latestTurn.question}</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-fg1">
                <Clock3 size={12} />
                {session.turns.length} question{session.turns.length !== 1 ? "s" : ""} in this session
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <DetailCard
            label="Flow"
            copy="Question thread → Round Table → Clash → Synthesis"
            icon={<Sparkles size={12} className="text-accent" />}
          />
          <DetailCard
            label="Brief"
            copy="The hero keeps the original decision brief stable while follow-ups refine the answer below."
            icon={<MessageSquareText size={12} className="text-accent" />}
          />
          <DetailCard
            label="Memory"
            copy="Each session now keeps its question thread, not just one isolated prompt."
            icon={<Clock3 size={12} className="text-accent" />}
          />
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-[rgba(54,31,16,0.08)] pt-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(54,31,16,0.08)] bg-white/58 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-fg1 backdrop-blur-sm">
          <ArrowUpRight size={12} className="text-accent" />
          Decision-grade strategy output
        </div>
        <div className="text-xs leading-relaxed text-fg1 sm:text-[13px]">
          Built for founders, product leaders, and operator-heavy teams who need clarity under constraint.
        </div>
      </div>
    </section>
  );
}
