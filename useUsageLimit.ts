import { useUser } from "@clerk/clerk-react";

const DEMO_KEY = "demo_usage_count";
const DEMO_LIMIT = 2;
const FREE_LIMIT = 5;

export type LimitType = "demo" | "free" | null;

export interface UsageLimitResult {
  canGenerate: boolean;
  isAtLimit: boolean;
  limitType: LimitType;
  usageLabel: string;
  used: number;
  limit: number;
  incrementUsage: () => Promise<void>;
  isSignedIn: boolean;
}

export function useUsageLimit(): UsageLimitResult {
  const { isSignedIn, user, isLoaded } = useUser();

  // ── Demo (not signed in) ──────────────────────────────────────────────────
  if (!isLoaded || !isSignedIn) {
    const used = parseInt(localStorage.getItem(DEMO_KEY) || "0", 10);
    const isAtLimit = used >= DEMO_LIMIT;

    const incrementUsage = async () => {
      const next = used + 1;
      localStorage.setItem(DEMO_KEY, String(next));
    };

    return {
      canGenerate: !isAtLimit,
      isAtLimit,
      limitType: isAtLimit ? "demo" : null,
      usageLabel: `${used} of ${DEMO_LIMIT} free`,
      used,
      limit: DEMO_LIMIT,
      incrementUsage,
      isSignedIn: false,
    };
  }

  // ── Signed in (free tier) ─────────────────────────────────────────────────
  const meta = (user.unsafeMetadata as { design_count?: number }) ?? {};
  const used = typeof meta.design_count === "number" ? meta.design_count : 0;
  const isAtLimit = used >= FREE_LIMIT;

  const incrementUsage = async () => {
    await user.update({
      unsafeMetadata: { ...user.unsafeMetadata, design_count: used + 1 },
    });
  };

  return {
    canGenerate: !isAtLimit,
    isAtLimit,
    limitType: isAtLimit ? "free" : null,
    usageLabel: `${used} of ${FREE_LIMIT} used`,
    used,
    limit: FREE_LIMIT,
    incrementUsage,
    isSignedIn: true,
  };
}
