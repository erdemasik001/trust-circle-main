"use client";

import { useState, useEffect } from "react";
import {
  BadgeCheck,
  Shield,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Heart,
  Settings,
  Globe,
  Moon,
  Info,
  ChevronRight,
  History,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { TierBadge } from "@/components/shared/tier-badge";
import { useLanguage } from "@/contexts/language-context";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useReputation } from "@/hooks/use-reputation";
import { useENS } from "@/hooks/use-ens";
import { useLoanHistory } from "@/hooks/use-loan-history";
import { useVoucherYield } from "@/hooks/use-voucher-yield";
import { REP_DECAY_MONTHS_INACTIVE, REP_DECAY_PER_MONTH } from "@/lib/constants";
import { useTheme } from "next-themes";
import type { Language } from "@/constants/i18n";

const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkce" },
  { value: "fr", label: "Francais" },
  { value: "es", label: "Espanol" },
];

// Vouch history is derived from hooks (vouchesReceived + vouchesGiven)

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const darkMode = theme === "dark";

  const { isAuthenticated } = useWalletAuth();
  const { userProfile, activeLoan, vouchesReceived, vouchesGiven, actions } = useTrustCircle();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const { currentTier: tier, nextTier, progress: tierProgress, tierColor } = useReputation(userProfile?.reputationScore ?? 0);
  const { ensName, setTextRecord } = useENS();
  const [updatingENS, setUpdatingENS] = useState(false);
  const { loanHistory } = useLoanHistory();
  const loanInterest = activeLoan ? activeLoan.totalDue - activeLoan.principal - activeLoan.amountRepaid : 0;
  const yieldInfo = useVoucherYield(vouchesGiven, loanInterest);

  // Rep decay warning: check if user has been inactive > REP_DECAY_MONTHS_INACTIVE
  const memberSinceMs = userProfile?.memberSince ? new Date(userProfile.memberSince).getTime() : 0;
  const monthsSinceMember = memberSinceMs > 0 ? (Date.now() - memberSinceMs) / (1000 * 60 * 60 * 24 * 30) : 0;
  const showDecayWarning = monthsSinceMember >= REP_DECAY_MONTHS_INACTIVE && (userProfile?.reputationScore ?? 0) > 0;

  const toggleDarkMode = () => {
    setTheme(darkMode ? "light" : "dark");
  };

  const handleUpdateENSProfile = async () => {
    if (!isAuthenticated || !userProfile) return;
    setUpdatingENS(true);
    try {
      await setTextRecord("reputation", String(userProfile.reputationScore));
      await setTextRecord("tier", tier.name);
      await setTextRecord("description", `Trust Circle ${tier.name} | Rep: ${userProfile.reputationScore}`);
    } finally {
      setUpdatingENS(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 py-6 relative">
        <div className="absolute inset-0 -top-6 rounded-3xl opacity-20" style={{ background: `radial-gradient(circle at 50% 0%, ${tierColor}, transparent 70%)` }} />
        <div
          className="relative flex h-18 w-18 items-center justify-center rounded-full text-2xl font-bold text-white ring-4 ring-offset-2 ring-offset-background shadow-lg"
          style={{ backgroundColor: `${tierColor}88`, borderColor: tierColor, boxShadow: `0 0 30px ${tierColor}44` }}
        >
          {(ensName ?? userProfile?.ensName ?? "??").slice(0, 2).toUpperCase()}
        </div>
        <div className="relative flex items-center gap-1.5">
          <h1 className="text-lg font-bold">{ensName ?? userProfile?.ensName}</h1>
          {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
        </div>
        <span className="relative font-mono text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {(userProfile?.address ?? "").slice(0, 6)}...{(userProfile?.address ?? "").slice(-4)}
        </span>
      </div>

      {/* Reputation + Tier */}
      <Card className="shadow-brand border-indigo-100 dark:border-indigo-900/40">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-muted-foreground">{t.reputationScore}</p>
              <p className="font-mono text-3xl font-bold">{userProfile?.reputationScore ?? 0}</p>
            </div>
            <TierBadge tierName={tier.name} size="lg" />
          </div>

          {nextTier && (
            <>
              <div className="flex items-center justify-between mb-1.5 text-xs text-muted-foreground">
                <span>{tier.name}</span>
                <span>{nextTier.name}</span>
              </div>
              <Progress value={tierProgress}>
                <ProgressTrack className="h-2">
                  <ProgressIndicator style={{ backgroundColor: tierColor }} />
                </ProgressTrack>
              </Progress>
              <p className="mt-1.5 text-xs text-muted-foreground text-center">
                {nextTier.minRep - (userProfile?.reputationScore ?? 0)} points to {nextTier.name}
              </p>
            </>
          )}

          {/* Update ENS Profile */}
          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-1.5 text-xs"
              onClick={handleUpdateENSProfile}
              disabled={updatingENS}
            >
              {updatingENS ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Updating ENS...</>
              ) : (
                <><Globe className="h-3 w-3" /> Sync Rep to ENS Profile</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="border-emerald-100 dark:border-emerald-900/40 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t.loansRepaid}</span>
            </div>
            <p className="font-mono text-2xl font-bold">{userProfile?.loansRepaid ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-rose-100 dark:border-rose-900/40 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500/10">
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t.loansDefaulted}</span>
            </div>
            <p className="font-mono text-2xl font-bold">{userProfile?.loansDefaulted ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 dark:border-blue-900/40 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t.totalBorrowed}</span>
            </div>
            <p className="font-mono text-2xl font-bold">${userProfile?.totalBorrowed ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-violet-100 dark:border-violet-900/40 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10">
                <Shield className="h-3.5 w-3.5 text-violet-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t.totalVouched}</span>
            </div>
            <p className="font-mono text-2xl font-bold">${userProfile?.totalVouched ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Voucher Yield (P1-9) */}
      {vouchesGiven.length > 0 && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">Voucher Earnings</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Pending Yield</p>
                <p className="font-mono text-lg font-bold text-green-600">${yieldInfo.pendingYield}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-xs text-muted-foreground">Yield Share</p>
                <p className="font-mono text-lg font-bold">{yieldInfo.yieldSharePercent}%</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Vouchers earn {yieldInfo.yieldSharePercent}% of loan interest
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rep Decay Warning (P1-10) */}
      {showDecayWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Reputation Decay Warning</p>
            <p className="mt-0.5 text-xs text-orange-600/80 dark:text-orange-400/70">
              No activity for {Math.floor(monthsSinceMember)} months. After {REP_DECAY_MONTHS_INACTIVE} months of inactivity,
              you lose {REP_DECAY_PER_MONTH} rep/month. Borrow or vouch to stay active.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
              <Clock className="h-3 w-3" />
              <span>Potential loss: -{REP_DECAY_PER_MONTH * Math.max(0, Math.floor(monthsSinceMember) - REP_DECAY_MONTHS_INACTIVE)} rep</span>
            </div>
          </div>
        </div>
      )}

      {/* Loan History (from on-chain data) */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4" />
          {t.loanHistory}
        </h2>
        <div className="flex flex-col gap-2">
          {loanHistory.length > 0 ? (
            loanHistory.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="text-sm font-medium">Loan #{loan.id.split("-")[1]}</p>
                  <p className="text-xs text-muted-foreground">{loan.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">${loan.principal}</p>
                  <span
                    className={`text-xs font-medium ${
                      loan.status === "Repaid"
                        ? "text-green-600"
                        : loan.status === "Active"
                          ? "text-blue-500"
                          : "text-red-500"
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No loan history yet</p>
          )}
        </div>
      </div>

      {/* Vouch History */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4" />
          {t.vouchHistory}
        </h2>
        <div className="flex flex-col gap-2">
          {[
            ...vouchesReceived.map((v) => ({ ...v, direction: "received" as const })),
            ...vouchesGiven.map((v) => ({ ...v, direction: "given" as const })),
          ].map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-xl border p-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                    v.direction === "given"
                      ? "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
                      : "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"
                  }`}
                >
                  {v.direction === "given" ? "G" : "R"}
                </div>
                <div>
                  <p className="text-sm">{v.voucher.ensName ?? v.voucher.address.slice(0, 10)}</p>
                  <p className="text-xs text-muted-foreground">
                    {v.direction === "given" ? "Given" : "Received"} - {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-mono text-sm font-medium">${v.amount}</p>
                  <span className={`text-xs ${v.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                    {v.isActive ? "Active" : "Pending"}
                  </span>
                </div>
                {v.direction === "given" && v.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={revokingId === v.id}
                    onClick={async () => {
                      setRevokingId(v.id);
                      try {
                        await actions.revokeVouch(v.voucher.address);
                      } finally {
                        setRevokingId(null);
                      }
                    }}
                  >
                    {revokingId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Revoke"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Settings className="h-4 w-4" />
          {t.settings}
        </h2>
        <Card>
          <CardContent className="p-0">
            {/* Language */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.language}</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="rounded-md border bg-background px-2 py-1 text-sm"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Separator />

            {/* Dark Mode */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.darkMode}</span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  darkMode ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <Separator />

            {/* About */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t.about}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Since */}
      <p className="text-center text-xs text-muted-foreground">
        {t.memberSince}: {userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString() : "N/A"}
      </p>
    </div>
  );
}
