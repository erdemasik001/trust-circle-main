"use client";

import { cn } from "@/lib/utils";
import { TIER_COLORS } from "@/lib/tiers";

interface TierBadgeProps {
  tierName: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function TierBadge({ tierName, size = "md" }: TierBadgeProps) {
  const color = TIER_COLORS[tierName] ?? "#6B7280";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        sizeClasses[size]
      )}
      style={{
        backgroundColor: `${color}1A`,
        color: color,
      }}
    >
      {tierName}
    </span>
  );
}
