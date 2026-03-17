"use client";

import { AlertTriangle, CheckCircle2, Menu, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ClashPanel } from "@/components/council/ClashPanel";
import { EmptyState } from "@/components/council/EmptyState";
import { HistorySidebar } from "@/components/council/HistorySidebar";
import { LoadingState } from "@/components/council/LoadingState";
import { PromptComposer } from "@/components/council/PromptComposer";
import { RoundTablePanel } from "@/components/council/RoundTablePanel";
import { SynthesisPanel } from "@/components/council/SynthesisPanel";
import { useCouncilSession } from "@/hooks/useCouncilSession";
import { ApiClientError, getApiBase } from "@/lib/api";

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

  const envApiBase = getApiBase();

  const apiHealth = useMemo(() => {
    if (typeof window === "undefined") {
      return { label: "API pending", tone: "neutral" as const };
    }

    const isLocalUi = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const localApi = envApiBase.includes("localhost") || envApiBase.includes("127.0.0.1");

    if (!isLocalUi && localApi) {
      return { label: "API misconfigured", tone: "warning" as const };
    }

    return { label: "API ready", tone: "ok" as const };
  }, [envApiBase]);

  const errorMeta = useMemo(() => {
    if (!error) return null;

    if (error instanceof ApiClientError) {
      if (error.kind === "config") {
        return {
          title: "Backend URL is not configured",
          message: error.message,
          help: "Set NEXT_PUBLIC_API_BASE_URL in Vercel to your deployed FastAPI URL, then redeploy.",
          tone: "warning" as const,
        };
      }

      if (error.kind === "network") {
        return {
          title: "Cannot reach backend",
          message: error.message,
          help: "Confirm your backend is running and CORS allows this frontend origin.",
          tone: "warning" as const,
        };
      }

      if (error.kind === "server") {
        return {
          title: "Backend returned an error",
          message: error.message,
          help: "Check backend logs and verify data ingest/index has completed.",
          tone: "danger" as const,
        };
      }
    }

    return {
      title: "Request failed",
      message: error.message,
      help: "Retry the request. If it persists, verify API URL and backend health.",
      tone: "danger" as const,
    };
  }, [error]);

  return (
    <main className="relative mx-auto min-h-screen w-full max-w-[1600px] px-4 pb-8 pt-4 lg:px-6 lg:pb-10 lg:pt-6">
      <div
        className={`fixed inset-0 z-30 bg-black/35 transition ${isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"} lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 w-[88vw] max-w-[340px] p-4 transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.18em] text-fg1">Session History</div>
          <button className="rounded-lg border border-black/10 p-1.5" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>
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

      <header className="panel mb-4 rounded-3xl p-5 lg:mb-6 lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-fg1">
              <Sparkles size={12} />
              The Strategy Council
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-tight text-fg0 lg:text-[2rem]">
              Four perspectives. One decision-ready strategy.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg1 lg:text-base">
              Ask one product or strategic question. The council runs a round table, isolates the core friction, and synthesizes a tactical 30/60/90 day plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`hidden items-center gap-1 rounded-full px-3 py-1 text-xs font-medium lg:inline-flex ${
                apiHealth.tone === "ok"
                  ? "border border-emerald-600/25 bg-emerald-500/10 text-emerald-800"
                  : apiHealth.tone === "warning"
                    ? "border border-amber-600/30 bg-amber-500/12 text-amber-800"
                    : "border border-black/10 bg-white/70 text-fg1"
              }`}
            >
              {apiHealth.tone === "ok" ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {apiHealth.label}
            </span>
            <button className="rounded-lg border border-black/15 bg-white/70 p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-[320px_1fr] lg:gap-6">
        <aside className="hidden lg:block">
          <HistorySidebar
            items={history}
            selectedId={selectedSessionId}
            isLoading={isHistoryLoading}
            onSelect={(id) => {
              void loadSession(id);
            }}
          />
        </aside>

        <section className="space-y-4 lg:space-y-5">
          <PromptComposer value={queryDraft} onChange={setQueryDraft} onSubmit={() => void submit()} isRunning={mode === "running"} />

          {errorMeta && (
            <section
              className={`rounded-2xl border p-4 ${
                errorMeta.tone === "warning"
                  ? "border-amber-600/35 bg-amber-50/80 text-amber-950"
                  : "border-red-500/35 bg-red-50/80 text-red-950"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5" />
                <div>
                  <div className="text-sm font-semibold">{errorMeta.title}</div>
                  <div className="mt-1 text-sm">{errorMeta.message}</div>
                  <div className="mt-2 text-xs opacity-90">{errorMeta.help}</div>
                  <div className="mt-2 rounded-lg border border-black/10 bg-white/55 px-2 py-1 font-mono text-[11px] text-fg1">
                    API base: {envApiBase}
                  </div>
                </div>
              </div>
            </section>
          )}

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
