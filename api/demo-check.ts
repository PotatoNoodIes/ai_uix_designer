import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEMO_LIMIT = 2;
const TTL_SECONDS = 60 * 60 * 24; // 24 hours

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function getClientIp(req: VercelRequest): string {
  // x-forwarded-for may be a comma-separated list; take the first (original client)
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return first.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? "unknown";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip = getClientIp(req);
  const hash = hashIp(ip);
  const key = `demo:ip:${hash}`;

  try {
    // Atomically increment and read the count
    const count = await redis.incr(key);

    // Set TTL only on first access (count === 1) so the window is per-first-visit
    if (count === 1) {
      await redis.expire(key, TTL_SECONDS);
    }

    if (count > DEMO_LIMIT) {
      return res.status(200).json({ allowed: false, count });
    }

    return res.status(200).json({ allowed: true, count });
  } catch (err) {
    console.error("[demo-check] Redis error:", err);
    // Fail open — don't block users if Redis is unreachable
    return res.status(200).json({ allowed: true, count: 0, error: "redis_unavailable" });
  }
}
