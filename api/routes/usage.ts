/**
 * GET /usage — current quota for the caller, so the UI can render counters
 * without trusting (or writing) a client-side tally.
 */
import { getUserId } from "../lib/clerk.ts";
import { peekQuota, getClientIp, type QuotaIdentity } from "../lib/quota.ts";

export async function handleUsage(req: Request): Promise<Response> {
  const userId = await getUserId(req);
  const identity: QuotaIdentity = userId
    ? { kind: "user", userId }
    : { kind: "anon", ip: getClientIp(req) };

  try {
    const quota = await peekQuota(identity);
    return Response.json({
      used: quota.used,
      limit: quota.limit,
      isSignedIn: quota.isSignedIn,
    });
  } catch (err) {
    console.error("[usage] Redis error:", err);
    return Response.json(
      { used: 0, limit: identity.kind === "user" ? 5 : 2, isSignedIn: identity.kind === "user" },
      { status: 200 }
    );
  }
}
