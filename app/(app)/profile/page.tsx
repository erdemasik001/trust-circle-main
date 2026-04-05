"use client";

import { useState } from "react";
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
  ArrowUpRight,
  CircleDollarSign,
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

  const memberSinceMs = userProfile?.memberSince ? new Date(userProfile.memberSince).getTime() : 0;
  const monthsSinceMember = memberSinceMs > 0 ? (Date.now() - memberSinceMs) / (1000 * 60 * 60 * 24 * 30) : 0;
  const showDecayWarning = monthsSinceMember >= REP_DECAY_MONTHS_INACTIVE && (userProfile?.reputationScore ?? 0) > 0;

  const toggleDarkMode = () => setTheme(darkMode ? "light" : "dark");

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

  const allVouches = [
    ...vouchesReceived.map((v) => ({ ...v, direction: "received" as const })),
    ...vouchesGiven.map((v) => ({ ...v, direction: "given" as const })),
  ];

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">

      {/* ── Profile Hero Card ── */}
      <Card className="overflow-hidden border-0 shadow-brand-lg">
        <div className="relative gradient-brand p-5 pb-4">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-6 -bottom-6 h-28 w-28 rounded-full bg-purple-300/15 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold ring-2 ring-white/30 shadow-lg"
              style={{ backgroundColor: `${tierColor}66`, color: "#FFF", textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}
            >
              {(ensName ?? userProfile?.ensName ?? "TC").slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold truncate" style={{ color: "#FFF", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                  {ensName ?? userProfile?.ensName ?? "—"}
                </h1>
                {userProfile?.verified && <BadgeCheck className="h-5 w-5 shrink-0" style={{ color: "#FFF", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }} />}
              </div>
              <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>
                {(userProfile?.address ?? "").slice(0, 6)}...{(userProfile?.address ?? "").slice(-4)}
              </span>
            </div>
            <TierBadge tierName={tier.name} size="md" variant="onGradient" />
          </div>
        </div>

        {/* Reputation + Progress inside same card */}
        <CardContent className="pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">{t.reputationScore}</p>
              <p className="font-mono text-2xl font-bold">{userProfile?.reputationScore ?? 0}</p>
            </div>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs h-8"
                onClick={handleUpdateENSProfile}
                disabled={updatingENS}
              >
                {updatingENS ? (
                  <><Loader2 className="h-3 w-3 animate-spin" /> {t.updatingENS}</>
                ) : (
                  <><Globe className="h-3 w-3" /> {t.syncRepToENS}</>
                )}
              </Button>
            )}
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
        </CardContent>
      </Card>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center pt-3 pb-3 px-1">
            <CreditCard className="h-4 w-4 text-emerald-500 mb-1" />
            <p className="font-mono text-lg font-bold">{userProfile?.loansRepaid ?? 0}</p>
            <p className="text-[9px] text-muted-foreground text-center leading-tight">{t.loansRepaid}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center pt-3 pb-3 px-1">
            <TrendingDown className="h-4 w-4 text-rose-500 mb-1" />
            <p className="font-mono text-lg font-bold">{userProfile?.loansDefaulted ?? 0}</p>
            <p className="text-[9px] text-muted-foreground text-center leading-tight">{t.loansDefaulted}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center pt-3 pb-3 px-1">
            <TrendingUp className="h-4 w-4 text-blue-500 mb-1" />
            <p className="font-mono text-lg font-bold">${userProfile?.totalBorrowed ?? 0}</p>
            <p className="text-[9px] text-muted-foreground text-center leading-tight">{t.totalBorrowed}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center pt-3 pb-3 px-1">
            <Shield className="h-4 w-4 text-violet-500 mb-1" />
            <p className="font-mono text-lg font-bold">${userProfile?.totalVouched ?? 0}</p>
            <p className="text-[9px] text-muted-foreground text-center leading-tight">{t.totalVouched}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Voucher Yield ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CircleDollarSign className="h-4 w-4 text-green-500" />
            {t.voucherEarnings}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vouchesGiven.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-50 dark:bg-green-950/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">{t.pendingYield}</p>
                  <p className="font-mono text-xl font-bold text-green-600">${yieldInfo.pendingYield}</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">{t.yieldShare}</p>
                  <p className="font-mono text-xl font-bold">{yieldInfo.yieldSharePercent}%</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t.vouchersEarnInterest} ({yieldInfo.yieldSharePercent}%)
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center py-4 text-center">
              <Heart className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">{t.searchForUser}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Rep Decay Warning ── */}
      {showDecayWarning && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{t.repDecayWarning}</p>
                <p className="mt-0.5 text-xs text-orange-600/80 dark:text-orange-400/70">
                  {t.noActivityFor} {Math.floor(monthsSinceMember)} {t.months}.
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400">
                  <Clock className="h-3 w-3" />
                  <span>{t.potentialLoss}: -{REP_DECAY_PER_MONTH * Math.max(0, Math.floor(monthsSinceMember) - REP_DECAY_MONTHS_INACTIVE)} rep</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Loan History ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            {t.loanHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loanHistory.length > 0 ? (
            <div className="flex flex-col gap-2">
              {loanHistory.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                  <div>
                    <p className="text-sm font-medium">{t.loanId} #{loan.id.split("-")[1]}</p>
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
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-5 text-center">
              <ArrowUpRight className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">{t.noLoanHistory}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Vouch History ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            {t.vouchHistory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allVouches.length > 0 ? (
            <div className="flex flex-col gap-2">
              {allVouches.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        v.direction === "given"
                          ? "bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-400"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                      }`}
                    >
                      {v.direction === "given" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{v.voucher.ensName ?? v.voucher.address.slice(0, 10)}</p>
                      <p className="text-xs text-muted-foreground">
                        {v.direction === "given" ? t.given : t.received}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-medium">${v.amount}</p>
                      <span className={`text-[10px] font-medium ${v.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                        {v.isActive ? t.active : t.pending}
                      </span>
                    </div>
                    {v.direction === "given" && v.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-[10px] text-red-500 border-red-200 hover:text-red-700 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                        disabled={revokingId === v.id}
                        onClick={async () => {
                          setRevokingId(v.id);
                          try { await actions.revokeVouch(v.voucher.address); } finally { setRevokingId(null); }
                        }}
                      >
                        {revokingId === v.id ? <Loader2 className="h-3 w-3 animate-spin" /> : t.revoke}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-5 text-center">
              <Shield className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-xs text-muted-foreground">{t.searchForUser}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Settings ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            {t.settings}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-1">
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
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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
              className={`relative h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${darkMode ? "translate-x-5" : "translate-x-0"}`} />
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

      {/* Member Since */}
      <p className="text-center text-xs text-muted-foreground pb-2">
        {t.memberSince}: {userProfile?.memberSince ? new Date(userProfile.memberSince).toLocaleDateString() : t.notAvailable}
      </p>
    </div>
  );
}
