"use client";

import { useCallback, useEffect, useState } from "react";

import { createSession, getSession, listSessions } from "@/lib/api";
import { CouncilSession, SessionListItem } from "@/types/council";

type Mode = "idle" | "running" | "loaded" | "error";

export function useCouncilSession() {
  const [mode, setMode] = useState<Mode>("idle");
  const [queryDraft, setQueryDraft] = useState("");
  const [history, setHistory] = useState<SessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<CouncilSession | null>(null);
  const [isHistoryLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const payload = await listSessions();
      setHistory(payload.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const submit = useCallback(async () => {
    if (!queryDraft.trim()) return;
    setMode("running");
    setError(null);
    try {
      const session = await createSession(queryDraft.trim());
      setActiveSession(session);
      setSelectedSessionId(session.session_id);
      setHistory((prev) => [
        {
          session_id: session.session_id,
          created_at: session.created_at,
          query: session.query,
          friction_summary: session.clash.friction_point,
          synthesis_summary: session.synthesis.recommendation,
        },
        ...prev,
      ]);
      setMode("loaded");
    } catch (err) {
      setMode("error");
      setError(err instanceof Error ? err.message : "Session failed");
    }
  }, [queryDraft]);

  const loadSession = useCallback(async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setMode("running");
    setError(null);
    try {
      const session = await getSession(sessionId);
      setActiveSession(session);
      setMode("loaded");
    } catch (err) {
      setMode("error");
      setError(err instanceof Error ? err.message : "Unable to load session");
    }
  }, []);

  return {
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
    refreshHistory: loadHistory,
  };
}
