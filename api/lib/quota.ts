import { Redis } from "@upstash/redis";
import { createHash } from "crypto";

export const DEMO_LIMIT = 2;
export const FREE_LIMIT = 5;
const DEMO_TTL_SECONDS = 60 * 60 * 24 * 5;
const USER_TTL_SECONDS = 60 * 60 * 24 * 30;

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

export type QuotaIdentity =
  | { kind: "user"; userId: string }
  | { kind: "anon"; ip: string };

function keyFor(identity: QuotaIdentity): string {
  return identity.kind === "user"
    ? `usage:user:${identity.userId}`
    : `demo:ip:${hashIp(identity.ip)}`;
}

function limitFor(identity: QuotaIdentity): number {
  return identity.kind === "user" ? FREE_LIMIT : DEMO_LIMIT;
}

export type QuotaState = {
  used: number;
  limit: number;
  allowed: boolean;
  isSignedIn: boolean;
};

export async function peekQuota(identity: QuotaIdentity): Promise<QuotaState> {
  const limit = limitFor(identity);
  const raw = await redis.get<number>(keyFor(identity));
  const used = typeof raw === "number" ? raw : 0;
  return {
    used,
    limit,
    allowed: used < limit,
    isSignedIn: identity.kind === "user",
  };
}

export async function consumeQuota(identity: QuotaIdentity): Promise<QuotaState> {
  const limit = limitFor(identity);
  const key = keyFor(identity);

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(
      key,
      identity.kind === "user" ? USER_TTL_SECONDS : DEMO_TTL_SECONDS
    );
  }

  return {
    used: count,
    limit,
    allowed: count <= limit,
    isSignedIn: identity.kind === "user",
  };
}

export async function refundQuota(identity: QuotaIdentity): Promise<void> {
  try {
    await redis.decr(keyFor(identity));
  } catch (err) {
    console.error("[quota] refund failed:", err);
  }
}
