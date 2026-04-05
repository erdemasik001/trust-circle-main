"use client";

import { cn } from "@/lib/utils";
import { TIER_COLORS } from "@/lib/tiers";

interface TierBadgeProps {
  tierName: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "onGradient";
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
  lg: "px-4 py-1.5 text-base",
};

export function TierBadge({ tierName, size = "md", variant = "default" }: TierBadgeProps) {
  const color = TIER_COLORS[tierName] ?? "#6B7280";

  if (variant === "onGradient") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-semibold whitespace-nowrap",
          sizeClasses[size]
        )}
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "#FFFFFF",
          textShadow: "0 1px 2px rgba(0,0,0,0.25)",
          backdropFilter: "blur(4px)",
        }}
      >
        {tierName}
      </span>
    );
  }

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
