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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useENS } from "@/hooks/use-ens";
import { MOCK_SEARCHABLE_USERS } from "@/constants/mock-data";

export default function VouchPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<typeof MOCK_SEARCHABLE_USERS[number] | null>(null);
  const [vouchAmount, setVouchAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { userProfile, vouchesGiven, actions } = useTrustCircle();
  const ens = useENS();

  const filteredUsers = searchQuery.length >= 2
    ? MOCK_SEARCHABLE_USERS.filter((u) =>
        u.ensName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const parsedAmount = parseFloat(vouchAmount) || 0;
  const isAmountValid = parsedAmount >= MIN_VOUCH_AMOUNT;

  // Mock: assume the borrower currently has $200 in vouches
  const borrowerTotalVouches = 200;
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
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold">Vouch Submitted!</h2>
        <p className="text-center text-sm text-muted-foreground">
          Your vouch will activate in {VOUCH_ACTIVATION_DELAY_HOURS} hours.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">{t.vouchTitle}</h1>
      </div>

      {/* Active positions notice */}
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <span className="text-sm text-muted-foreground">
          You have <span className="font-semibold text-foreground">{userProfile?.activeVouchCount ?? 0}/{MAX_VOUCHES_PER_USER}</span> {t.maxPositions}
        </span>
        <Shield className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedUser(null);
          }}
          placeholder={t.searchByEns}
          className="pl-9"
        />
      </div>

      {/* Search Results */}
      {!selectedUser && filteredUsers.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {filteredUsers.map((user) => {
            const userTier = getTierForRep(user.reputationScore);
            const userTierColor = TIER_COLORS[userTier.name] ?? "#6B7280";
            return (
              <button
                key={user.address}
                onClick={() => {
                  setSelectedUser(user);
                  setSearchQuery(user.ensName);
                }}
                className="flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: `${userTierColor}66` }}
                >
                  {user.ensName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{user.ensName}</span>
                    {user.verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Rep: {user.reputationScore} | {userTier.name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected User Profile */}
      {selectedUser && (
        <>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const userTier = getTierForRep(selectedUser.reputationScore);
                    const userTierColor = TIER_COLORS[userTier.name] ?? "#6B7280";
                    return (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ backgroundColor: `${userTierColor}66` }}
                      >
                        {selectedUser.ensName.slice(0, 2).toUpperCase()}
                      </div>
                    );
                  })()}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{selectedUser.ensName}</span>
                      {selectedUser.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTierForRep(selectedUser.reputationScore).name} tier
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedUser(null); setSearchQuery(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="font-mono text-lg font-bold">{selectedUser.reputationScore}</p>
                  <p className="text-[10px] text-muted-foreground">Rep Score</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="font-mono text-lg font-bold text-green-600">{selectedUser.loansRepaid}</p>
                  <p className="text-[10px] text-muted-foreground">Repaid</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="font-mono text-lg font-bold text-red-500">{selectedUser.loansDefaulted}</p>
                  <p className="text-[10px] text-muted-foreground">Defaulted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vouch Amount */}
          <Card>
            <CardContent className="pt-5">
              <label className="mb-2 block text-sm font-medium">{t.vouchAmount}</label>
              <Input
                type="number"
                value={vouchAmount}
                onChange={(e) => setVouchAmount(e.target.value)}
                placeholder={`Min $${MIN_VOUCH_AMOUNT}`}
                className="font-mono text-xl h-12"
                min={MIN_VOUCH_AMOUNT}
              />
              {parsedAmount > 0 && parsedAmount < MIN_VOUCH_AMOUNT && (
                <p className="mt-1 text-xs text-red-500">Minimum vouch amount is ${MIN_VOUCH_AMOUNT}</p>
              )}
            </CardContent>
          </Card>

          {/* Concentration Warning */}
          {isAmountValid && exceedsConcentration && (
            <div className="rounded-lg border border-orange-300 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                    Concentration Warning
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    Your vouch would be {concentrationPercent}% of this borrower&apos;s total. Max allowed is {MAX_CONCENTRATION_PERCENT}% {t.concentrationCap}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 48h Activation Notice */}
          <div className="rounded-lg border border-yellow-300/50 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/30">
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {t.activationNotice}
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">
                  {t.activationDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Confirm */}
          <Button
            onClick={handleConfirm}
            disabled={!isAmountValid || exceedsConcentration || submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              t.confirmVouch
            )}
          </Button>
        </>
      )}

      {/* Empty state */}
      {!selectedUser && filteredUsers.length === 0 && searchQuery.length >= 2 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Search className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No users found</p>
        </div>
      )}

      {!selectedUser && searchQuery.length < 2 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Shield className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Search for a user to vouch for</p>
          <p className="text-xs text-muted-foreground">Enter at least 2 characters</p>
        </div>
      )}
    </div>
  );
}
