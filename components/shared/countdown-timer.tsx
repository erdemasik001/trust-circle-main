"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isPast: false };
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() =>
    getTimeRemaining(new Date(targetDate))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getTimeRemaining(new Date(targetDate)));
    }, 60_000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const isUrgent = !remaining.isPast && remaining.days <= 2;

  if (remaining.isPast) {
    return (
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="size-4 text-red-400" />
        <span className="text-sm font-medium text-red-400">
          {label ? `${label}: ` : ""}Overdue
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Clock
        className={cn("size-4", isUrgent ? "text-amber-400" : "text-zinc-400")}
      />
      <span
        className={cn(
          "text-sm font-medium",
          isUrgent ? "text-amber-400" : "text-zinc-400"
        )}
      >
        {label ? `${label}: ` : ""}
        {remaining.days > 0 && `${remaining.days}d `}
        {remaining.hours}h
        {remaining.days === 0 && ` ${remaining.minutes}m`}
      </span>
    </div>
  );
}
