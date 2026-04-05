"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  CircleDollarSign,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/language-context";
import { GRACE_PERIOD_DAYS, LATE_FEE_PERCENT } from "@/lib/constants";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { CountdownTimer } from "@/components/shared/countdown-timer";

export default function RepayPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [partialAmount, setPartialAmount] = useState("");
  const [paymentType, setPaymentType] = useState<"full" | "partial" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { activeLoan, actions } = useTrustCircle();
  const loan = activeLoan;

  const handleRepay = async (amount: number) => {
    setSubmitting(true);
    try {
      await actions.repay(amount);
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  if (!loan) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <CircleDollarSign className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="text-xl font-bold">{t.noActiveLoanTitle}</h2>
        <p className="text-center text-sm text-muted-foreground">
          {t.noActiveLoanDesc}
        </p>
        <Button onClick={() => router.push("/dashboard")} variant="outline">
          {t.backToDashboard}
        </Button>
      </div>
    );
  }

  const now = new Date();
  const dueDate = new Date(loan.dueDate);
  const gracePeriodEnd = new Date(loan.gracePeriodEnd);

  const isPastDue = now > dueDate;
  const isInGracePeriod = isPastDue && now <= gracePeriodEnd;
  const daysUntilDue = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const daysLeftInGrace = isInGracePeriod
    ? Math.max(0, Math.ceil((gracePeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : GRACE_PERIOD_DAYS;

  const baseBalance = loan.totalDue - loan.amountRepaid;
  const lateFee = isInGracePeriod ? baseBalance * (LATE_FEE_PERCENT / 100) : 0;
  const totalBalance = baseBalance + lateFee;

  const parsedPartial = parseFloat(partialAmount) || 0;
  const isPartialValid = parsedPartial > 0 && parsedPartial <= totalBalance && Number.isFinite(parsedPartial);

  const repaymentProgress = Math.round((loan.amountRepaid / loan.totalDue) * 100);

  if (submitted) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-bold">{t.paymentSuccess}</h2>
        <p className="text-center text-sm text-muted-foreground">
          {t.redirecting}
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
        <h1 className="text-lg font-bold">{t.repayTitle}</h1>
      </div>

      {/* Active Loan Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <CircleDollarSign className="h-4 w-4 text-blue-500" />
            {t.loanId} #{loan.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.principal}</span>
              <span className="font-mono">${loan.principal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.totalDue}</span>
              <span className="font-mono">${loan.totalDue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.repaid}</span>
              <span className="font-mono text-green-600">${loan.amountRepaid.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.dueDate}</span>
              <span className="font-mono">{dueDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.vouchers}</span>
              <span className="text-sm">{loan.vouchers.join(", ")}</span>
            </div>

            <Progress value={repaymentProgress} className="mt-2">
              <ProgressTrack className="h-1.5">
                <ProgressIndicator className="bg-green-500" />
              </ProgressTrack>
            </Progress>
            <p className="text-xs text-muted-foreground">{repaymentProgress}% {t.percentRepaid}</p>
          </div>
        </CardContent>
      </Card>

      {/* Balance Due */}
      <Card className="border-blue-200 dark:border-blue-900">
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground mb-1">{t.balanceDue}</p>
          <p className="font-mono text-3xl font-bold">${totalBalance.toFixed(2)}</p>
          {!isPastDue && (
            <div className="mt-1">
              <CountdownTimer targetDate={loan.dueDate} label="Due" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grace Period Indicator */}
      {isInGracePeriod && (
        <Card className="border-orange-300 dark:border-orange-800">
          <CardContent className="pt-5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <p className="font-semibold text-orange-600 dark:text-orange-400">
                  {t.gracePeriodActive}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t.gracePeriodDesc}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600">
                    {t.daysRemaining(daysLeftInGrace)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Late Fee Display */}
      {isInGracePeriod && lateFee > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900 dark:bg-red-950/30">
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{t.lateFee}</span>
          <span className="font-mono text-sm font-semibold text-red-600 dark:text-red-400">
            +${lateFee.toFixed(2)}
          </span>
        </div>
      )}

      {/* Payment Options */}
      <div className="flex flex-col gap-3">
        {/* Full Repayment */}
        <Button
          onClick={() => handleRepay(totalBalance)}
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting && paymentType === "full" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.processing}
            </>
          ) : (
            <>
              {t.repayFull} - ${totalBalance.toFixed(2)}
            </>
          )}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">{t.or}</span>
          <Separator className="flex-1" />
        </div>

        {/* Partial Payment */}
        <Card>
          <CardContent className="pt-5">
            <label className="mb-2 block text-sm font-medium">{t.repayPartial}</label>
            <Input
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(e.target.value)}
              placeholder={`Max $${totalBalance.toFixed(2)}`}
              className="font-mono text-xl h-12"
              min={0}
              max={totalBalance}
            />
            {parsedPartial > totalBalance && (
              <p className="mt-1 text-xs text-red-500">{t.cannotExceedBalance} (${totalBalance.toFixed(2)})</p>
            )}
            {parsedPartial < 0 && (
              <p className="mt-1 text-xs text-red-500">{t.enterPositiveAmount}</p>
            )}
            {partialAmount !== "" && parsedPartial === 0 && (
              <p className="mt-1 text-xs text-red-500">{t.enterGreaterThanZero}</p>
            )}
            <Button
              onClick={() => {
                setPaymentType("partial");
                handleRepay(parsedPartial);
              }}
              disabled={!isPartialValid || submitting}
              variant="outline"
              className="mt-3 w-full"
              size="lg"
            >
              {submitting && paymentType === "partial" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.processing}
                </>
              ) : (
                `${t.pay} $${parsedPartial > 0 ? parsedPartial.toFixed(2) : "0.00"}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-muted/50 p-3">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {t.repayInfo}
          </p>
        </div>
      </div>
    </div>
  );
}
