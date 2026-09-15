/**
 * Verifies Clerk session JWTs server-side.
 *
 * The client previously tracked identity and quota entirely in the browser
 * (localStorage + Clerk unsafeMetadata, both user-writable). Anything that
 * spends our API key has to verify the token here instead.
 */
import { verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;

if (!secretKey) {
  console.error(
    "[clerk] CLERK_SECRET_KEY is not set — signed-in users will be treated as anonymous."
  );
}

/**
 * Returns the Clerk user id for a request, or null if unauthenticated.
 * Never throws: a bad token is simply "not signed in", which falls through
 * to the stricter anonymous demo limit.
 */
export async function getUserId(req: Request): Promise<string | null> {
  if (!secretKey) return null;

  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const payload = await verifyToken(token, { secretKey });
    return payload.sub ?? null;
  } catch (err) {
    console.warn("[clerk] token verification failed:", (err as Error).message);
    return null;
  }
}
