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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { TierBadge } from "@/components/shared/tier-badge";
import { useLanguage } from "@/contexts/language-context";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useReputation } from "@/hooks/use-reputation";
import { useENS } from "@/hooks/use-ens";
import type { Language } from "@/constants/i18n";

const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "tr", label: "Turkce" },
  { value: "fr", label: "Francais" },
  { value: "es", label: "Espanol" },
];

// Mock loan history
const MOCK_LOAN_HISTORY = [
  { id: "loan-001", principal: 50, status: "Repaid" as const, date: "2026-03-05", interestPaid: 7.5 },
  { id: "loan-002", principal: 100, status: "Repaid" as const, date: "2026-03-12", interestPaid: 12 },
  { id: "loan-003", principal: 150, status: "Repaid" as const, date: "2026-03-18", interestPaid: 18 },
  { id: "loan-004", principal: 150, status: "Active" as const, date: "2026-03-20", interestPaid: 0 },
];

// Vouch history is now derived from hooks (vouchesReceived + vouchesGiven)

export default function ProfilePage() {
  const { t, language, setLanguage } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);

  const { userProfile, vouchesReceived, vouchesGiven } = useTrustCircle();
  const { currentTier: tier, nextTier, progress: tierProgress, tierColor } = useReputation(userProfile?.reputationScore ?? 0);
  const { ensName } = useENS();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-4">
      {/* Mock Mode Banner */}
      <div className="rounded-lg border border-yellow-300/50 bg-yellow-50 px-3 py-2 dark:border-yellow-700/50 dark:bg-yellow-950/30">
        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
          {t.mockDataNote}
        </p>
      </div>

      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white"
          style={{ backgroundColor: `${tierColor}66` }}
        >
          {(ensName ?? userProfile?.ensName ?? "??").slice(0, 2).toUpperCase()}
        </div>
        <div className="flex items-center gap-1.5">
          <h1 className="text-lg font-bold">{ensName ?? userProfile?.ensName}</h1>
          {userProfile?.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {(userProfile?.address ?? "").slice(0, 6)}...{(userProfile?.address ?? "").slice(-4)}
        </span>
      </div>

      {/* Reputation + Tier */}
      <Card>
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
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs text-muted-foreground">{t.loansRepaid}</span>
            </div>
            <p className="font-mono text-2xl font-bold">{userProfile?.loansRepaid ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs text-muted-foreground">{t.loansDefaulted}</span>
            </div>
            <p className="font-mono text-2xl font-bold">{userProfile?.loansDefaulted ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs text-muted-foreground">{t.totalBorrowed}</span>
            </div>
            <p className="font-mono text-2xl font-bold">${userProfile?.totalBorrowed ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-xs text-muted-foreground">{t.totalVouched}</span>
            </div>
            <p className="font-mono text-2xl font-bold">${userProfile?.totalVouched ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Loan History */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <History className="h-4 w-4" />
          {t.loanHistory}
        </h2>
        <div className="flex flex-col gap-2">
          {MOCK_LOAN_HISTORY.map((loan) => (
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
          ))}
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
              <div className="text-right">
                <p className="font-mono text-sm font-medium">${v.amount}</p>
                <span className={`text-xs ${v.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                  {v.isActive ? "Active" : "Pending"}
                </span>
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
