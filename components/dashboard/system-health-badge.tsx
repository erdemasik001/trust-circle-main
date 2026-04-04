"use client";

import { cn } from "@/lib/utils";

interface SystemHealthBadgeProps {
  status: "GREEN" | "YELLOW" | "RED" | "RECOVERY";
}

const statusConfig = {
  GREEN: { dot: "bg-green-500", text: "text-green-400", label: "Healthy" },
  YELLOW: { dot: "bg-yellow-500", text: "text-yellow-400", label: "Caution" },
  RED: { dot: "bg-red-500", text: "text-red-400", label: "Paused" },
  RECOVERY: { dot: "bg-blue-500", text: "text-blue-400", label: "Recovering" },
} as const;

export function SystemHealthBadge({ status }: SystemHealthBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1">
      <span className={cn("size-2 rounded-full", config.dot)} />
      <span className={cn("text-xs font-medium", config.text)}>
        {config.label}
      </span>
    </div>
  );
}
