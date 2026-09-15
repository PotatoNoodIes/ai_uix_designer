/**
 * Talks to our own API for the default (server-key) path.
 *
 * Nothing here knows a Gemini key: the server holds it, builds the prompts and
 * meters usage. See api/routes/generate.ts.
 */
import type { GenerateRequest, UsageInfo } from "@api/shared/types";

const API_BASE = "/uix/api";

/** Set by AuthTokenProvider so plain functions can reach Clerk's getToken(). */
let tokenGetter: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(fn: (() => Promise<string | null>) | null) {
  tokenGetter = fn;
}

export class UsageLimitError extends Error {
  constructor(
    public limitType: "demo" | "free",
    public usage: UsageInfo | null
  ) {
    super("limit_reached");
    this.name = "UsageLimitError";
  }
}

/** Last usage figures the server reported, so the UI can render counters. */
let latestUsage: UsageInfo | null = null;
const usageListeners = new Set<(u: UsageInfo | null) => void>();

export function onUsageChange(fn: (u: UsageInfo | null) => void): () => void {
  usageListeners.add(fn);
  return () => {
    usageListeners.delete(fn);
  };
}

function publishUsage(usage: UsageInfo | null) {
  if (!usage) return;
  latestUsage = usage;
  usageListeners.forEach((fn) => fn(usage));
}

export function getLatestUsage() {
  return latestUsage;
}

async function authHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  try {
    const token = await tokenGetter?.();
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // Not signed in, or Clerk unavailable — falls back to the demo limit.
  }
  return headers;
}

export async function requestGeneration<T>(body: GenerateRequest): Promise<T> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);

  if (res.status === 429 && payload?.error === "limit_reached") {
    publishUsage(payload.usage);
    throw new UsageLimitError(payload.limitType ?? "demo", payload.usage ?? null);
  }

  if (!res.ok) {
    throw new Error(payload?.error || `Generation failed (${res.status}).`);
  }

  publishUsage(payload.usage);
  return payload.result as T;
}

export async function fetchUsage(): Promise<UsageInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/usage`, { headers: await authHeaders() });
    if (!res.ok) return null;
    const usage = (await res.json()) as UsageInfo;
    publishUsage(usage);
    return usage;
  } catch {
    return null;
  }
}
