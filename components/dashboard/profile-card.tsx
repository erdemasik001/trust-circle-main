"use client";

import { TierBadge } from "@/components/shared/tier-badge";
import { RepScore } from "@/components/shared/rep-score";
import { BadgeCheck } from "lucide-react";

interface ProfileCardProps {
  ensName: string;
  address: string;
  reputationScore: number;
  verified: boolean;
  tierName: string;
  tierColor: string;
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getInitials(name: string): string {
  const parts = name.replace(".trustcircle.eth", "").replace(".eth", "").split(".");
  return parts[0]?.slice(0, 2).toUpperCase() ?? "TC";
}

export function ProfileCard({
  ensName,
  address,
  reputationScore,
  verified,
  tierName,
  tierColor,
}: ProfileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 gradient-brand shadow-brand-lg">
      {/* Decorative blurs */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-purple-300/15 blur-2xl" />
      <div className="absolute right-12 bottom-2 h-16 w-16 rounded-full bg-indigo-300/10 blur-xl" />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-white/20 blur-md scale-125" />
          <div
            className="relative flex size-13 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2 ring-white/30 shadow-lg"
            style={{ backgroundColor: `${tierColor}55`, color: "#FFFFFF", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
          >
            {getInitials(ensName)}
          </div>
        </div>

        {/* Identity */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span
              className="truncate text-base font-bold"
              style={{ color: "#FFFFFF", textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}
            >
              {ensName || "—"}
            </span>
            {verified && (
              <BadgeCheck className="size-4 shrink-0" style={{ color: "#FFFFFF", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />
            )}
          </div>
          <span
            className="font-mono text-xs"
            style={{ color: "rgba(255,255,255,0.85)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
          >
            {truncateAddress(address)}
          </span>
        </div>

        {/* Rep Score */}
        <RepScore score={reputationScore} />
      </div>

      {/* Tier badge row */}
      <div className="relative mt-4 flex items-center justify-between">
        <TierBadge tierName={tierName} size="sm" variant="onGradient" />
        <span
          className="text-xs font-semibold"
          style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
        >
          {reputationScore} / 1000 rep
        </span>
      </div>
    </div>
  );
}
