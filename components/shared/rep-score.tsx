"use client";

import { cn } from "@/lib/utils";

interface RepScoreProps {
  score: number;
  maxScore?: number;
}

export function RepScore({ score, maxScore = 1000 }: RepScoreProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const radius = 36;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="88"
        height="88"
        viewBox="0 0 80 80"
        className="-rotate-90"
      >
        {/* Background ring */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* Progress ring */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#repGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="repGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
      </svg>
      <span
        className={cn(
          "absolute font-mono text-lg font-bold tracking-tight text-white"
        )}
      >
        {score}
      </span>
    </div>
  );
}
