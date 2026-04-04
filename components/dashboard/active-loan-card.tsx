"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { type MockLoan } from "@/constants/mock-data";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign } from "lucide-react";

interface ActiveLoanCardProps {
  loan: MockLoan;
}

export function ActiveLoanCard({ loan }: ActiveLoanCardProps) {
  const repaidPercentage = Math.round((loan.amountRepaid / loan.totalDue) * 100);
  const remaining = loan.totalDue - loan.amountRepaid;

  return (
    <div className="rounded-2xl bg-[#1A1A1A] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="size-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">
            Active Loan
          </span>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            loan.status === "Active" && "bg-blue-500/10 text-blue-400",
            loan.status === "Grace" && "bg-amber-500/10 text-amber-400",
            loan.status === "Repaid" && "bg-green-500/10 text-green-400",
            loan.status === "Defaulted" && "bg-red-500/10 text-red-400"
          )}
        >
          {loan.status}
        </span>
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-zinc-500">Principal</p>
          <p className="font-mono text-sm font-semibold text-white">
            ${loan.principal}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Total Due</p>
          <p className="font-mono text-sm font-semibold text-white">
            ${loan.totalDue.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500">Remaining</p>
          <p className="font-mono text-sm font-semibold text-white">
            ${remaining.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Repayment progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Repaid</span>
          <span className="font-mono text-zinc-300">
            ${loan.amountRepaid} / ${loan.totalDue.toFixed(2)} ({repaidPercentage}%)
          </span>
        </div>
        <Progress
          value={repaidPercentage}
          className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-white/10 [&_[data-slot=progress-indicator]]:bg-green-500 [&_[data-slot=progress-indicator]]:rounded-full"
        />
      </div>

      {/* Due date countdown */}
      <CountdownTimer targetDate={loan.dueDate} label="Due" />

      {/* Repay button */}
      <Link href="/repay" className="block">
        <Button
          variant="default"
          className="w-full gap-2"
        >
          Repay Now
          <ArrowRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}
