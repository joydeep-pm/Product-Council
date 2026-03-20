import { CouncilSession, SessionListResponse } from "@/types/council";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type ApiErrorKind = "config" | "network" | "server" | "validation";

export class ApiClientError extends Error {
  kind: ApiErrorKind;
  status?: number;
  apiBase: string;

  constructor(kind: ApiErrorKind, message: string, apiBase: string, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.kind = kind;
    this.status = status;
    this.apiBase = apiBase;
  }
}

export function getApiBase() {
  return API_BASE;
}

function isLocalApiBase(base: string) {
  return base.includes("localhost") || base.includes("127.0.0.1");
}

function assertApiBaseConfigured() {
  if (typeof window === "undefined") return;
  const isLocalUi = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const usesLocalApi = isLocalApiBase(API_BASE);
  if (!isLocalUi && usesLocalApi) {
    throw new ApiClientError(
      "config",
      "Backend URL is not configured for production. Set NEXT_PUBLIC_API_BASE_URL to your deployed API domain.",
      API_BASE,
    );
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  assertApiBaseConfigured();

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new ApiClientError("network", `Cannot reach backend API at ${API_BASE}.`, API_BASE);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.error?.message) message = payload.error.message;
      if (payload?.detail && typeof payload.detail === "string") message = payload.detail;
    } catch {
      // no-op
    }
    throw new ApiClientError(response.status >= 500 ? "server" : "validation", message, API_BASE, response.status);
  }

  return (await response.json()) as T;
}

export async function createSession(query: string): Promise<CouncilSession> {
  return requestJson<CouncilSession>(`${API_BASE}/api/v1/council/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
}

export async function listSessions(limit = 30, offset = 0): Promise<SessionListResponse> {
  return requestJson<SessionListResponse>(`${API_BASE}/api/v1/council/sessions?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
  });
}

export async function appendSessionQuestion(sessionId: string, question: string): Promise<CouncilSession> {
  return requestJson<CouncilSession>(`${API_BASE}/api/v1/council/sessions/${sessionId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    cache: "no-store",
  });
}

export async function getSession(sessionId: string): Promise<CouncilSession> {
  return requestJson<CouncilSession>(`${API_BASE}/api/v1/council/sessions/${sessionId}`, {
    cache: "no-store",
  });
}
