/**
 * POST /demo-check — gate-screen check for anonymous visitors.
 *
 * Read-only: it reports remaining demo credits but does not consume one.
 * Generation is metered in /generate, which is where the key is actually spent.
 */
import { peekQuota, getClientIp } from "../lib/quota.ts";

export async function handleDemoCheck(req: Request): Promise<Response> {
  if (process.env.NODE_ENV === "development") {
    return Response.json({ allowed: true });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const quota = await peekQuota({ kind: "anon", ip: getClientIp(req) });
    return Response.json({
      allowed: quota.allowed,
      count: quota.used,
      limit: quota.limit,
    });
  } catch (err) {
    // Fails open by design: this only unlocks the demo UI. The real limit is
    // enforced in /generate, which fails closed.
    console.error("[demo-check] Redis error:", err);
    return Response.json({ allowed: true, count: 0, error: "redis_unavailable" });
  }
}
