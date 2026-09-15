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
    console.error("[demo-check] Redis error:", err);
    return Response.json({ allowed: true, count: 0, error: "redis_unavailable" });
  }
}
