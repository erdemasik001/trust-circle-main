"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  BadgeCheck,
  Shield,
  Info,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  X,
  Users,
  TrendingUp,
  CircleDollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { getTierForRep, TIER_COLORS } from "@/lib/tiers";
import {
  MIN_VOUCH_AMOUNT,
  MAX_VOUCHES_PER_USER,
  MAX_CONCENTRATION_PERCENT,
  VOUCH_ACTIVATION_DELAY_HOURS,
} from "@/lib/constants";
import { useReadContract } from "wagmi";
import { CONTRACTS, TRUST_CIRCLE_ABI } from "@/lib/contracts";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useENS } from "@/hooks/use-ens";
import { useRegisteredUsers, type RegisteredUser } from "@/hooks/use-registered-users";
import { TxButton } from "@/components/shared/tx-button";

export default function VouchPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [vouchAmount, setVouchAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { userProfile, vouchesGiven, actions } = useTrustCircle();
  const ens = useENS();
  const { users: registeredUsers } = useRegisteredUsers();

  const { data: borrowerProfile } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getUserProfile",
    args: selectedUser ? [selectedUser.address as `0x${string}`] : undefined,
    query: { enabled: !!selectedUser },
  });

  const filteredUsers = searchQuery.length >= 2
    ? registeredUsers.filter((u) =>
        u.ensName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const parsedAmount = parseFloat(vouchAmount) || 0;
  const isAmountValid = parsedAmount >= MIN_VOUCH_AMOUNT;

  const onChainTotal = borrowerProfile
    ? Number((borrowerProfile as { totalVouchesReceived: bigint }).totalVouchesReceived) / 1e6
    : 0;
  const borrowerTotalVouches = onChainTotal;
  const concentrationPercent = borrowerTotalVouches > 0
    ? Math.round((parsedAmount / (borrowerTotalVouches + parsedAmount)) * 100)
    : 100;
  const exceedsConcentration = concentrationPercent > MAX_CONCENTRATION_PERCENT;

  const handleConfirm = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await actions.vouch(selectedUser.address, parsedAmount);
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-xl font-bold">{t.vouchSuccess}</h2>
        <p className="text-center text-sm text-muted-foreground">
          {VOUCH_ACTIVATION_DELAY_HOURS > 0
            ? `${t.activationNotice} (${VOUCH_ACTIVATION_DELAY_HOURS}h)`
            : t.redirecting}
        </p>
      </div>
    );
  }

  const activeCount = userProfile?.activeVouchCount ?? 0;
  const positionPercent = Math.round((activeCount / MAX_VOUCHES_PER_USER) * 100);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">{t.vouchTitle}</h1>
          <p className="text-xs text-muted-foreground">{t.activeVouchPositions}: {activeCount}/{MAX_VOUCHES_PER_USER}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
          <Shield className="h-4.5 w-4.5 text-emerald-500" />
        </div>
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="pt-5 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedUser(null);
              }}
              placeholder={t.searchByEns}
              className="pl-9 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {!selectedUser && filteredUsers.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <div className="flex flex-col">
              {filteredUsers.map((user, idx) => {
                const userTier = getTierForRep(user.reputationScore);
                const userTierColor = TIER_COLORS[userTier.name] ?? "#6B7280";
                return (
                  <div key={user.address}>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setSearchQuery(user.ensName);
                      }}
                      className="flex items-center gap-3 rounded-xl p-3 w-full text-left transition-colors hover:bg-muted/50"
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: userTierColor }}
                      >
                        {user.ensName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold truncate">{user.ensName}</span>
                          {user.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            Rep: {user.reputationScore}
                          </span>
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${userTierColor}1A`, color: userTierColor }}
                          >
                            {userTier.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <span className="text-green-600 font-medium">{user.loansRepaid}</span> / <span className="text-red-500 font-medium">{user.loansDefaulted}</span>
                      </div>
                    </button>
                    {idx < filteredUsers.length - 1 && <Separator className="mx-3" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected User + Vouch Form */}
      {selectedUser && (
        <Card className="border-emerald-200/60 dark:border-emerald-900/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{t.vouch}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => { setSelectedUser(null); setSearchQuery(""); }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* User info */}
            <div className="flex items-center gap-3 mb-4">
              {(() => {
                const userTier = getTierForRep(selectedUser.reputationScore);
                const userTierColor = TIER_COLORS[userTier.name] ?? "#6B7280";
                return (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: userTierColor }}
                  >
                    {selectedUser.ensName.slice(0, 2).toUpperCase()}
                  </div>
                );
              })()}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold truncate">{selectedUser.ensName}</span>
                  {selectedUser.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
                </div>
                <span className="text-xs text-muted-foreground">
                  {getTierForRep(selectedUser.reputationScore).name} {t.tier.toLowerCase()}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="flex flex-col items-center rounded-xl bg-muted/50 p-3">
                <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                <p className="font-mono text-base font-bold">{selectedUser.reputationScore}</p>
                <p className="text-[10px] text-muted-foreground">{t.repScore}</p>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-green-50 dark:bg-green-950/20 p-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mb-1" />
                <p className="font-mono text-base font-bold text-green-600">{selectedUser.loansRepaid}</p>
                <p className="text-[10px] text-muted-foreground">{t.repaid}</p>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-red-50 dark:bg-red-950/20 p-3">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 mb-1" />
                <p className="font-mono text-base font-bold text-red-500">{selectedUser.loansDefaulted}</p>
                <p className="text-[10px] text-muted-foreground">{t.defaulted}</p>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Amount input */}
            <label className="mb-2 block text-sm font-medium">{t.vouchAmount}</label>
            <div className="relative mb-1">
              <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={vouchAmount}
                onChange={(e) => setVouchAmount(e.target.value)}
                placeholder={`Min $${MIN_VOUCH_AMOUNT}`}
                className="font-mono text-xl h-13 pl-9"
                min={MIN_VOUCH_AMOUNT}
              />
            </div>
            {parsedAmount > 0 && parsedAmount < MIN_VOUCH_AMOUNT && (
              <p className="mb-2 text-xs text-red-500">{t.minVouchAmount} ${MIN_VOUCH_AMOUNT}</p>
            )}

            {/* Concentration Warning */}
            {isAmountValid && exceedsConcentration && (
              <div className="mt-3 rounded-xl border border-orange-300 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                      {t.concentrationWarning}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {concentrationPercent}% — Max {MAX_CONCENTRATION_PERCENT}% {t.concentrationCap}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activation notice */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200/60 dark:border-yellow-800/40 px-3 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{t.activationNotice}</p>
              </div>
            </div>

            {/* Confirm button */}
            <TxButton
              onClick={handleConfirm}
              loading={submitting}
              disabled={!isAmountValid || exceedsConcentration}
              className="w-full mt-4"
            >
              <Shield className="h-4 w-4 mr-1.5" />
              {t.confirmVouch}
            </TxButton>
          </CardContent>
        </Card>
      )}

      {/* Empty state - no search */}
      {!selectedUser && searchQuery.length < 2 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Users className="h-7 w-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{t.searchForUser}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.enterMin2Chars}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state - no results */}
      {!selectedUser && filteredUsers.length === 0 && searchQuery.length >= 2 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Search className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{t.noUsersFound}</p>
          </CardContent>
        </Card>
      )}

      {/* Info footer */}
      <div className="rounded-xl bg-muted/40 border border-border/40 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {t.activationDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
