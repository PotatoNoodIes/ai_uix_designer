import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { fetchUsage, onUsageChange, getLatestUsage } from "@/services/aiClient";
import type { UsageInfo } from "@api/shared/types";

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

/**
 * Display-only view of the quota. The server is the source of truth — it meters
 * every generation in api/routes/generate.ts and returns the new counts, which
 * arrive here through the aiClient usage subscription.
 *
 * Nothing in this hook can grant credit: editing these values in the browser
 * changes the label, not the limit.
 */
export function useUsageLimit(): UsageLimitResult {
  const { isSignedIn, isLoaded } = useUser();
  const [usage, setUsage] = useState<UsageInfo | null>(() => getLatestUsage());

  useEffect(() => onUsageChange(setUsage), []);

  useEffect(() => {
    if (!isLoaded) return;
    void fetchUsage();
  }, [isLoaded, isSignedIn]);

  // incrementUsage is retained so callers don't change shape; the server has
  // already counted the generation by the time this runs.
  const incrementUsage = useCallback(async () => {
    await fetchUsage();
  }, []);

  const signedIn = Boolean(isSignedIn);
  const limit = usage?.limit ?? (signedIn ? FREE_LIMIT : DEMO_LIMIT);
  const used = usage?.used ?? 0;
  const isAtLimit = used >= limit;

  return {
    canGenerate: !isAtLimit,
    isAtLimit,
    limitType: isAtLimit ? (signedIn ? "free" : "demo") : null,
    usageLabel: signedIn ? `${used} of ${limit} used` : `${used} of ${limit} free`,
    used,
    limit,
    incrementUsage,
    isSignedIn: signedIn,
  };
}
