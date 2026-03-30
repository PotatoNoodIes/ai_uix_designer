import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DEMO_LIMIT = 2;
const TTL_SECONDS = 60 * 60 * 24 * 5;

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    if (process.env.NODE_ENV === 'development') {
      return Response.json({ allowed: true });
    }

    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const ip = getClientIp(req);
    const hash = hashIp(ip);
    const key = `demo:ip:${hash}`;

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, TTL_SECONDS);
      }

      if (count > DEMO_LIMIT) {
        return Response.json({ allowed: false, count });
      }

      return Response.json({ allowed: true, count });
    } catch (err) {
      console.error("[demo-check] Redis error:", err);
      return Response.json({ allowed: true, count: 0, error: "redis_unavailable" });
    }
  },
});

console.log(`[demo-check] listening on port ${server.port}`);
