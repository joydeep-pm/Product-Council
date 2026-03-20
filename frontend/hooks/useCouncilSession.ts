"use client";

import { useCallback, useEffect, useState } from "react";

import { ApiClientError, appendSessionQuestion, createSession, getSession, listSessions } from "@/lib/api";
import { CouncilSession, SessionListItem } from "@/types/council";

type Mode = "idle" | "running" | "loaded" | "error";

export function useCouncilSession() {
  const [mode, setMode] = useState<Mode>("idle");
  const [queryDraft, setQueryDraft] = useState("");
  const [history, setHistory] = useState<SessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<CouncilSession | null>(null);
  const [isHistoryLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizeError = useCallback((err: unknown, fallback: string): Error => {
    if (err instanceof Error) return err;
    return new ApiClientError("validation", fallback, "");
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const payload = await listSessions();
      setHistory(payload.items);
    } catch (err) {
      setError(normalizeError(err, "Failed to load history"));
    } finally {
      setHistoryLoading(false);
    }
  }, [normalizeError]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const submit = useCallback(async () => {
    const trimmed = queryDraft.trim();
    if (!trimmed) return;
    setMode("running");
    setError(null);
    try {
      const session = selectedSessionId
        ? await appendSessionQuestion(selectedSessionId, trimmed)
        : await createSession(trimmed);

      setActiveSession(session);
      setSelectedSessionId(session.session_id);
      setHistory((prev) => {
        const nextItem = {
          session_id: session.session_id,
          created_at: session.created_at,
          query: session.query,
          question_count: session.turns.length || 1,
          friction_summary: session.clash.friction_point,
          synthesis_summary: session.synthesis.recommendation,
        };
        const withoutCurrent = prev.filter((item) => item.session_id !== session.session_id);
        return [nextItem, ...withoutCurrent];
      });
      setQueryDraft("");
      setMode("loaded");
    } catch (err) {
      setMode("error");
      setError(normalizeError(err, "Session failed"));
    }
  }, [normalizeError, queryDraft, selectedSessionId]);

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
      setError(normalizeError(err, "Unable to load session"));
    }
  }, [normalizeError]);

  const startNewSession = useCallback(() => {
    setSelectedSessionId(null);
    setActiveSession(null);
    setMode("idle");
    setError(null);
    setQueryDraft("");
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
    startNewSession,
    refreshHistory: loadHistory,
  };
}
