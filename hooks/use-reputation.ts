"use client";

import { useMemo } from "react";
import {
  getTierForRep,
  getNextTier,
  getTierProgress,
  TIER_COLORS,
  type Tier,
} from "@/lib/tiers";
import { REP_FROZEN_THRESHOLD } from "@/lib/constants";

// ─── Types ──────────────────────────────────────────────────

export interface UseReputationReturn {
  currentTier: Tier;
  nextTier: Tier | null;
  progress: number;
  tierColor: string;
  effectiveRep: number;
  isFrozen: boolean;
}

// ─── Hook ───────────────────────────────────────────────────

export function useReputation(reputationScore: number): UseReputationReturn {
  return useMemo(() => {
    const currentTier = getTierForRep(reputationScore);
    const nextTier = getNextTier(reputationScore);
    const progress = getTierProgress(reputationScore);
    const tierColor = TIER_COLORS[currentTier.name] ?? "#6B7280";

    // effectiveRep could incorporate on-chain decay in real mode;
    // for now it mirrors the raw score.
    const effectiveRep = reputationScore;
    const isFrozen = reputationScore < REP_FROZEN_THRESHOLD;

    return {
      currentTier,
      nextTier,
      progress,
      tierColor,
      effectiveRep,
      isFrozen,
    };
  }, [reputationScore]);
}
