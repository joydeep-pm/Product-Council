"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { ClashPanel } from "@/components/council/ClashPanel";
import { EmptyState } from "@/components/council/EmptyState";
import { HistorySidebar } from "@/components/council/HistorySidebar";
import { LoadingState } from "@/components/council/LoadingState";
import { PromptComposer } from "@/components/council/PromptComposer";
import { RoundTablePanel } from "@/components/council/RoundTablePanel";
import { SynthesisPanel } from "@/components/council/SynthesisPanel";
import { useCouncilSession } from "@/hooks/useCouncilSession";

export default function HomePage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const {
    mode,
    queryDraft,
    setQueryDraft,
    history,
    selectedSessionId,
    activeSession,
    isHistoryLoading,
    error,
    submit,
    loadSession,
  } = useCouncilSession();

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1600px] p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h1 className="text-lg font-semibold">The Strategy Council</h1>
        <button className="rounded-lg border border-white/20 p-2" onClick={() => setSidebarOpen((v) => !v)}>
          <Menu size={18} />
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-2rem)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr] lg:gap-6">
        <div className={`${isSidebarOpen ? "block" : "hidden"} lg:block`}>
          <HistorySidebar
            items={history}
            selectedId={selectedSessionId}
            isLoading={isHistoryLoading}
            onSelect={(id) => {
              setSidebarOpen(false);
              void loadSession(id);
            }}
          />
        </div>

        <section className="space-y-4 lg:space-y-5">
          <PromptComposer value={queryDraft} onChange={setQueryDraft} onSubmit={() => void submit()} isRunning={mode === "running"} />

          {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

          {!activeSession && mode !== "running" && <EmptyState />}
          {mode === "running" && <LoadingState />}

          {activeSession && (
            <>
              <RoundTablePanel entries={activeSession.round_table} isLoading={false} />
              <ClashPanel clash={activeSession.clash} isLoading={false} />
              <SynthesisPanel synthesis={activeSession.synthesis} isLoading={false} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
