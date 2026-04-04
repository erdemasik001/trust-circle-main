"use client";

import Link from "next/link";
import { BadgeCheck, HandCoins, Shield, ArrowUpRight, Activity, CreditCard, TrendingUp, CircleDollarSign, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { useLanguage } from "@/contexts/language-context";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useReputation } from "@/hooks/use-reputation";
import { useInsurance } from "@/hooks/use-insurance";
import { useCircuitBreaker } from "@/hooks/use-circuit-breaker";
import { MOCK_RECENT_ACTIVITY } from "@/constants/mock-data";

const activityIcons: Record<string, typeof Activity> = {
  repayment: CreditCard,
  vouch_received: Shield,
  vouch_given: Heart,
  borrow: HandCoins,
  rep_change: TrendingUp,
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const { userProfile, activeLoan, availableLimit, vouchesReceived, isLoading } = useTrustCircle();
  const { currentTier: tier, nextTier, progress: tierProgress, tierColor } = useReputation(userProfile?.reputationScore ?? 0);
  const insurance = useInsurance();
  const circuitBreaker = useCircuitBreaker();

  const activeVouches = vouchesReceived.filter((v) => v.isActive);
  const totalVouchCapacity = activeVouches.reduce((s, v) => s + v.amount, 0);

  const balanceDue = activeLoan ? activeLoan.totalDue - activeLoan.amountRepaid : 0;

  const healthColors: Record<string, string> = {
    GREEN: "bg-green-500/10 text-green-600",
    YELLOW: "bg-yellow-500/10 text-yellow-600",
    RED: "bg-red-500/10 text-red-600",
    RECOVERY: "bg-blue-500/10 text-blue-600",
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      {/* Greeting */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight">
          {t.hello} {userProfile?.ensName}
        </h1>
        {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
      </div>

      {/* Mock Mode Banner */}
      <div className="rounded-lg border border-yellow-300/50 bg-yellow-50 px-3 py-2 dark:border-yellow-700/50 dark:bg-yellow-950/30">
        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
          {t.mockDataNote}
        </p>
      </div>

      {/* Profile Card */}
      <ProfileCard
        ensName={userProfile?.ensName ?? ""}
        address={userProfile?.address ?? ""}
        reputationScore={userProfile?.reputationScore ?? 0}
        verified={userProfile?.verified ?? false}
        tierName={tier.name}
        tierColor={tierColor}
      />

      {/* Tier Progress */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t.tier}</span>
            <span className="text-xs text-muted-foreground">
              {nextTier ? `${userProfile?.reputationScore ?? 0} / ${nextTier.minRep} ${t.reputationScore}` : "Max tier"}
            </span>
          </div>
          <Progress value={tierProgress}>
            <ProgressTrack className="h-2">
              <ProgressIndicator style={{ backgroundColor: tierColor }} />
            </ProgressTrack>
          </Progress>
          {nextTier && (
            <p className="mt-2 text-xs text-muted-foreground">
              {nextTier.minRep - (userProfile?.reputationScore ?? 0)} points to {nextTier.name}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Credit Limit Bar */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{t.creditLimit}</span>
            <span className="font-mono text-sm font-semibold">${tier.maxBorrow}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t.available}</span>
            <span className="font-mono text-xs text-green-600">${availableLimit.limit}</span>
          </div>
          <Progress value={Math.round((availableLimit.limit / Math.max(tier.maxBorrow, 1)) * 100)}>
            <ProgressTrack className="h-2">
              <ProgressIndicator className="bg-green-500" />
            </ProgressTrack>
          </Progress>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{availableLimit.voucherCount} {t.vouchers}</span>
            <span className="text-border">|</span>
            <span>${totalVouchCapacity} {t.capacity}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Loan Card */}
      {activeLoan && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CircleDollarSign className="h-4 w-4 text-blue-500" />
              {t.activeLoan}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-2xl font-bold">${balanceDue.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{t.balanceDue}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date(activeLoan.dueDate).toLocaleDateString()}</p>
                <p className="text-xs text-muted-foreground">{t.dueDate}</p>
              </div>
            </div>
            <Progress value={Math.round((activeLoan.amountRepaid / activeLoan.totalDue) * 100)} className="mt-3">
              <ProgressTrack className="h-1.5">
                <ProgressIndicator className="bg-blue-500" />
              </ProgressTrack>
            </Progress>
            <p className="mt-1 text-xs text-muted-foreground">
              ${activeLoan.amountRepaid} / ${activeLoan.totalDue} repaid
            </p>
          </CardContent>
        </Card>
      )}

      {/* System Health Badge */}
      <div className="flex items-center justify-between rounded-xl border p-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.systemHealth}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${healthColors[circuitBreaker.health]}`}>
            {circuitBreaker.health}
          </span>
          <span className="text-xs text-muted-foreground">
            {t.insurancePool}: ${insurance.poolBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/borrow">
          <Button variant="outline" className="flex h-auto w-full flex-col gap-1.5 py-4">
            <HandCoins className="h-5 w-5 text-blue-500" />
            <span className="text-xs font-medium">{t.borrow}</span>
          </Button>
        </Link>
        <Link href="/vouch">
          <Button variant="outline" className="flex h-auto w-full flex-col gap-1.5 py-4">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-xs font-medium">{t.vouch}</span>
          </Button>
        </Link>
        <Link href="/repay">
          <Button variant="outline" className="flex h-auto w-full flex-col gap-1.5 py-4">
            <ArrowUpRight className="h-5 w-5 text-violet-500" />
            <span className="text-xs font-medium">{t.repay}</span>
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Recent Activity</h2>
        <div className="flex flex-col gap-2">
          {MOCK_RECENT_ACTIVITY.map((item) => {
            const Icon = activityIcons[item.type] ?? Activity;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
                {item.amount && (
                  <span className="shrink-0 font-mono text-sm font-medium">
                    ${item.amount}
                  </span>
                )}
                {item.repChange && (
                  <span className={`shrink-0 font-mono text-sm font-medium ${item.repChange > 0 ? "text-green-600" : "text-red-500"}`}>
                    {item.repChange > 0 ? "+" : ""}{item.repChange}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
