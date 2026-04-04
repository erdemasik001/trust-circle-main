"use client";

import { cn } from "@/lib/utils";

interface CreditLimitBarProps {
  available: number;
  tierMax: number;
  used: number;
}

export function CreditLimitBar({
  available,
  tierMax,
  used,
}: CreditLimitBarProps) {
  const usedPercent = tierMax > 0 ? Math.min((used / tierMax) * 100, 100) : 0;
  const availablePercent =
    tierMax > 0 ? Math.min((available / tierMax) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      {/* Labels */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-300">
          Available:{" "}
          <span className="font-mono font-semibold text-white">
            ${available}
          </span>
        </span>
        <span className="text-zinc-500">
          Tier Max:{" "}
          <span className="font-mono font-medium text-zinc-400">
            ${tierMax.toLocaleString()}
          </span>
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
        {/* Used portion */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${usedPercent}%` }}
        />
        {/* Available portion (lighter, stacked after used) */}
        <div
          className="absolute inset-y-0 rounded-full bg-blue-500/25 transition-all duration-500"
          style={{
            left: `${usedPercent}%`,
            width: `${availablePercent}%`,
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500" />
          <span>Used (${used})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500/25" />
          <span>Available (${available})</span>
        </div>
      </div>
    </div>
  );
}
