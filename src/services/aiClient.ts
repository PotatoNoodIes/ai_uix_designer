import type { GenerateRequest, UsageInfo } from "@api/shared/types";

const API_BASE = "/uix/api";

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
  }
  return headers;
}

export async function requestGeneration<T>(body: GenerateRequest): Promise<T> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("text/event-stream")) {
    const payload = await res.json().catch(() => null);

    if (res.status === 429 && payload?.error === "limit_reached") {
      publishUsage(payload.usage);
      throw new UsageLimitError(payload.limitType ?? "demo", payload.usage ?? null);
    }

    throw new Error(payload?.error || `Generation failed (${res.status}).`);
  }

  if (!res.body) {
    throw new Error("Generation failed: no response body.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let payload: { result?: T; usage?: UsageInfo | null; error?: string } | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    let split: number;
    while ((split = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, split);
      buffer = buffer.slice(split + 2);

      if (frame.startsWith(":")) continue;

      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (line) {
        try {
          payload = JSON.parse(line.slice(5).trim());
        } catch {
          throw new Error("Generation failed: malformed response.");
        }
      }
    }
  }

  if (!payload) {
    throw new Error("The connection closed before generation finished.");
  }
  if (payload.error) {
    throw new Error(payload.error);
  }

  publishUsage(payload.usage ?? null);
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
