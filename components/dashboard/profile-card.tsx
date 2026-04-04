"use client";

import { cn } from "@/lib/utils";
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
  return parts[0]?.slice(0, 2).toUpperCase() ?? "??";
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
    <div className="rounded-2xl bg-[#1A1A1A] p-5">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: `${tierColor}33` }}
        >
          {getInitials(ensName)}
        </div>

        {/* Identity */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-base font-semibold text-white">
              {ensName}
            </span>
            {verified && (
              <BadgeCheck className="size-4 shrink-0 text-blue-400" />
            )}
          </div>
          <span className="font-mono text-xs text-zinc-500">
            {truncateAddress(address)}
          </span>
        </div>

        {/* Rep Score */}
        <RepScore score={reputationScore} />
      </div>

      {/* Tier badge row */}
      <div className="mt-4 flex items-center justify-between">
        <TierBadge tierName={tierName} size="sm" />
        <span className="text-xs text-zinc-500">
          Rep Score: {reputationScore} / 1000
        </span>
      </div>
    </div>
  );
}
