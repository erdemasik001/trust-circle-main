"use client";

import { cn } from "@/lib/utils";
import { getTierForRep, getNextTier, getTierProgress, TIER_COLORS } from "@/lib/tiers";
import { Progress } from "@/components/ui/progress";

interface TierProgressProps {
  reputationScore: number;
}

export function TierProgress({ reputationScore }: TierProgressProps) {
  const currentTier = getTierForRep(reputationScore);
  const nextTier = getNextTier(reputationScore);
  const progress = getTierProgress(reputationScore);
  const currentColor = TIER_COLORS[currentTier.name] ?? "#6B7280";

  return (
    <div className="space-y-2">
      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-300">
          Current:{" "}
          <span style={{ color: currentColor }}>
            {currentTier.name} ({reputationScore})
          </span>
        </span>
        {nextTier ? (
          <span className="text-zinc-500">
            Next:{" "}
            <span style={{ color: TIER_COLORS[nextTier.name] ?? "#6B7280" }}>
              {nextTier.name} ({nextTier.minRep})
            </span>
          </span>
        ) : (
          <span className="text-zinc-500">Max tier reached</span>
        )}
      </div>

      {/* Progress bar */}
      <Progress
        value={progress}
        className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/10"
      >
        <style>{`
          [data-slot="progress-indicator"] {
            background: ${currentColor} !important;
            border-radius: 9999px;
          }
        `}</style>
      </Progress>

      {/* Percentage */}
      <p className="text-right text-xs text-zinc-500">
        {progress}% to next tier
      </p>
    </div>
  );
}
