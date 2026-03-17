import { CouncilSession, SessionListResponse } from "@/types/council";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      if (payload?.error?.message) message = payload.error.message;
      if (payload?.detail && typeof payload.detail === "string") message = payload.detail;
    } catch {
      // no-op
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export async function createSession(query: string): Promise<CouncilSession> {
  const response = await fetch(`${API_BASE}/api/v1/council/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  return handleResponse<CouncilSession>(response);
}

export async function listSessions(limit = 30, offset = 0): Promise<SessionListResponse> {
  const response = await fetch(`${API_BASE}/api/v1/council/sessions?limit=${limit}&offset=${offset}`, {
    cache: "no-store",
  });
  return handleResponse<SessionListResponse>(response);
}

export async function getSession(sessionId: string): Promise<CouncilSession> {
  const response = await fetch(`${API_BASE}/api/v1/council/sessions/${sessionId}`, {
    cache: "no-store",
  });
  return handleResponse<CouncilSession>(response);
}
