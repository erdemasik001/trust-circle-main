"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { BadgeCheck, HandCoins, Shield, ArrowUpRight, Activity, CreditCard, TrendingUp, CircleDollarSign, Heart, Snowflake, Gavel, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { WalletButton } from "@/components/shared/wallet-button";
import { useLanguage } from "@/contexts/language-context";
import { useQueryClient } from "@tanstack/react-query";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useReputation } from "@/hooks/use-reputation";
import { useInsurance } from "@/hooks/use-insurance";
import { useCircuitBreaker } from "@/hooks/use-circuit-breaker";
import { CountdownTimer } from "@/components/shared/countdown-timer";
import { type ActivityItem } from "@/types";

const activityIcons: Record<string, typeof Activity> = {
  repayment: CreditCard,
  vouch_received: Shield,
  vouch_given: Heart,
  borrow: HandCoins,
  rep_change: TrendingUp,
};

export default function DashboardPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { userProfile, activeLoan, availableLimit, vouchesReceived, vouchesGiven, isLoading, actions } = useTrustCircle();
  const [liquidateAddr, setLiquidateAddr] = useState("");
  const [liquidating, setLiquidating] = useState(false);
  const [showLiquidate, setShowLiquidate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }, [queryClient]);

  // Build recent activity from live vouch + loan data
  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    // Active loan repayments
    if (activeLoan && activeLoan.amountRepaid > 0) {
      items.push({
        id: "act-repay",
        type: "repayment",
        description: `Repaid $${activeLoan.amountRepaid} on ${activeLoan.id}`,
        timestamp: "Recently",
        amount: activeLoan.amountRepaid,
      });
    }

    // Active borrow
    if (activeLoan) {
      items.push({
        id: "act-borrow",
        type: "borrow",
        description: `Borrowed $${activeLoan.principal}`,
        timestamp: activeLoan.borrowedAt ? new Date(activeLoan.borrowedAt).toLocaleDateString() : "Recently",
        amount: activeLoan.principal,
      });
    }

    // Vouches received
    for (const v of vouchesReceived) {
      items.push({
        id: `act-vr-${v.id}`,
        type: "vouch_received",
        description: `${v.voucher.ensName ?? v.voucher.address.slice(0, 10)} vouched $${v.amount}`,
        timestamp: new Date(v.createdAt).toLocaleDateString(),
        amount: v.amount,
      });
    }

    // Vouches given
    for (const v of vouchesGiven) {
      items.push({
        id: `act-vg-${v.id}`,
        type: "vouch_given",
        description: `Vouched $${v.amount} for someone`,
        timestamp: new Date(v.createdAt).toLocaleDateString(),
        amount: v.amount,
      });
    }

    return items.slice(0, 5);
  }, [activeLoan, vouchesReceived, vouchesGiven]);
  const { currentTier: tier, nextTier, progress: tierProgress, tierColor, isFrozen } = useReputation(userProfile?.reputationScore ?? 0);
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Welcome back</p>
          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-xl font-bold tracking-tight">
              {userProfile?.ensName?.split(".")[0] ?? "User"}
            </h1>
            {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
          <WalletButton />
        </div>
      </div>

      {/* Frozen Account Warning */}
      {(isFrozen || userProfile?.isFrozen) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <Snowflake className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">{t.accountFrozen}</p>
            <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">{t.accountFrozenDesc}</p>
            {userProfile?.defaultCooldownUntil && userProfile.defaultCooldownUntil > Date.now() / 1000 && (
              <p className="mt-1.5 font-mono text-[10px] text-red-500">
                {t.cooldownActive}: {Math.ceil((userProfile.defaultCooldownUntil - Date.now() / 1000) / 86400)} {t.days}
              </p>
            )}
          </div>
        </div>
      )}

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
      <Card className="shadow-sm border-border/60">
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
      <Card className="shadow-sm border-border/60">
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
                <CountdownTimer targetDate={activeLoan.dueDate} label={t.dueDate} />
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
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.systemHealth}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${healthColors[circuitBreaker.health]}`}>
            {circuitBreaker.health}
          </span>
          <span className="text-xs text-muted-foreground">
            Pool: ${insurance.poolBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2.5">
        <Link href="/borrow">
          <div className="group flex h-auto w-full flex-col items-center gap-2.5 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-4 shadow-sm transition-all hover:shadow-md hover:shadow-blue-500/10 hover:border-blue-200 hover:-translate-y-0.5 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-transparent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <HandCoins className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">{t.borrow}</span>
          </div>
        </Link>
        <Link href="/vouch">
          <div className="group flex h-auto w-full flex-col items-center gap-2.5 rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-white py-4 shadow-sm transition-all hover:shadow-md hover:shadow-emerald-500/10 hover:border-emerald-200 hover:-translate-y-0.5 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-transparent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">{t.vouch}</span>
          </div>
        </Link>
        <Link href="/repay">
          <div className="group flex h-auto w-full flex-col items-center gap-2.5 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50 via-violet-50/50 to-white py-4 shadow-sm transition-all hover:shadow-md hover:shadow-violet-500/10 hover:border-violet-200 hover:-translate-y-0.5 dark:border-violet-900/50 dark:from-violet-950/40 dark:to-transparent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 group-hover:bg-violet-500/20 transition-colors">
              <ArrowUpRight className="h-5 w-5 text-violet-500" />
            </div>
            <span className="text-[10px] font-semibold text-violet-700 dark:text-violet-400">{t.repay}</span>
          </div>
        </Link>
        <button onClick={() => setShowLiquidate(!showLiquidate)}>
          <div className="group flex h-auto w-full flex-col items-center gap-2.5 rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50 via-rose-50/50 to-white py-4 shadow-sm transition-all hover:shadow-md hover:shadow-rose-500/10 hover:border-rose-200 hover:-translate-y-0.5 dark:border-rose-900/50 dark:from-rose-950/40 dark:to-transparent">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
              <Gavel className="h-5 w-5 text-rose-500" />
            </div>
            <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400">{t.liquidate}</span>
          </div>
        </button>
      </div>

      {/* Liquidation Section */}
      {showLiquidate && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-red-500" />
                <span className="text-sm font-semibold">{t.liquidateTitle}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowLiquidate(false)}>{t.close}</Button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              {t.liquidateDesc}
            </p>
            <Input
              value={liquidateAddr}
              onChange={(e) => setLiquidateAddr(e.target.value)}
              placeholder="0x... borrower address"
              className="mb-3 font-mono text-xs"
            />
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              disabled={!liquidateAddr.startsWith("0x") || liquidateAddr.length < 42 || liquidating}
              onClick={async () => {
                setLiquidating(true);
                try {
                  await actions.liquidate(liquidateAddr);
                  setLiquidateAddr("");
                  setShowLiquidate(false);
                } finally {
                  setLiquidating(false);
                }
              }}
            >
              {liquidating ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />{t.processing}</> : t.liquidate}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="pb-2">
        <h2 className="mb-3 text-sm font-semibold">{t.recentActivity}</h2>
        <div className="flex flex-col gap-2">
          {recentActivity.map((item) => {
            const Icon = activityIcons[item.type] ?? Activity;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm transition-colors hover:bg-accent/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-brand-subtle">
                  <Icon className="h-4 w-4 text-indigo-500" />
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
