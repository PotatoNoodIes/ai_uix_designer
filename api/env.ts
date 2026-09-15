import { config } from "dotenv";

config();

const REQUIRED = [
  "GEMINI_API_KEY",
  "CLERK_SECRET_KEY",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
] as const;

export function reportEnv() {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`[env] missing: ${missing.join(", ")}`);
  } else {
    console.log("[env] all required variables present");
  }
  return missing;
}
