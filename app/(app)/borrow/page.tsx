"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  Shield,
  Clock,
  Percent,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/language-context";
import { INSURANCE_CONTRIBUTION_PERCENT } from "@/lib/constants";
import { useTrustCircle } from "@/hooks/use-trust-circle";
import { useReputation } from "@/hooks/use-reputation";
import { useCircuitBreaker } from "@/hooks/use-circuit-breaker";
import { bpsToPercent } from "@/lib/tiers";
import { TxButton } from "@/components/shared/tx-button";

export default function BorrowPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { userProfile, availableLimit, vouchesReceived, actions } = useTrustCircle();
  const { currentTier: tier, tierColor } = useReputation(userProfile?.reputationScore ?? 0);
  const circuitBreaker = useCircuitBreaker();

  const activeVouches = vouchesReceived.filter((v) => v.isActive);
  const availableCredit = availableLimit.limit;

  const parsedAmount = parseFloat(amount) || 0;
  const interestRatePercent = bpsToPercent(tier.interestBps);
  const interestAmount = parsedAmount * (interestRatePercent / 100);
  const insuranceFee = parsedAmount * (INSURANCE_CONTRIBUTION_PERCENT / 100);
  const totalDue = parsedAmount + interestAmount + insuranceFee;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + tier.maxDays);

  const isAmountValid = parsedAmount > 0 && parsedAmount <= availableCredit;

  const handleSubmit = async () => {
    if (!circuitBreaker.canCreateLoan) return;
    setSubmitting(true);
    try {
      await actions.borrow(parsedAmount);
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => step > 0 ? setStep(step - 1) : router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold">{t.borrowTitle}</h1>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? "gradient-brand shadow-sm" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Tier Info */}
        {step === 0 && (
          <motion.div key="tier" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <Card>
              <CardContent className="pt-5">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${tierColor}1A` }}
                  >
                    <Shield className="h-5 w-5" style={{ color: tierColor }} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: tierColor }}>{tier.name}</p>
                    <p className="text-xs text-muted-foreground">{t.yourTier}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      {t.maxBorrow}
                    </div>
                    <p className="font-mono text-lg font-bold">${tier.maxBorrow}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Percent className="h-3 w-3" />
                      {t.interestRate}
                    </div>
                    <p className="font-mono text-lg font-bold">{bpsToPercent(tier.interestBps)}%</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" />
                      {t.duration}
                    </div>
                    <p className="font-mono text-lg font-bold">{tier.maxDays} {t.days}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Shield className="h-3 w-3" />
                      {t.minVouchers}
                    </div>
                    <p className="font-mono text-lg font-bold">{tier.minVouchers}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                  <div className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {t.available}: <span className="font-mono font-semibold">${availableCredit}</span> based on {availableLimit.voucherCount} active {t.vouchers}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={() => setStep(1)} className="mt-4 w-full" size="lg">
              {t.next} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Step 2: Amount Input */}
        {step === 1 && (
          <motion.div key="amount" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <Card>
              <CardContent className="pt-5">
                <label className="mb-2 block text-sm font-medium">{t.amount} ({t.usdc})</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`Max $${availableCredit}`}
                  className="font-mono text-2xl h-14"
                  min={0}
                  max={availableCredit}
                />
                {parsedAmount > availableCredit && (
                  <p className="mt-1 text-xs text-red-500">{t.exceedsCredit} (${availableCredit})</p>
                )}

                {parsedAmount > 0 && parsedAmount <= availableCredit && (
                  <div className="mt-5">
                    <h3 className="mb-3 text-sm font-semibold">{t.terms}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.principal}</span>
                        <span className="font-mono">${parsedAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.interest} ({interestRatePercent}% for {tier.maxDays}d)</span>
                        <span className="font-mono">${interestAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.insuranceFee}</span>
                        <span className="font-mono">${insuranceFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>{t.totalDue}</span>
                        <span className="font-mono">${totalDue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.dueDate}</span>
                        <span className="font-mono">{dueDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={() => setStep(2)} disabled={!isAmountValid} className="mt-4 w-full" size="lg">
              {t.next} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Step 3: Warning */}
        {step === 2 && (
          <motion.div key="warning" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            <Card className="border-red-200 dark:border-red-900">
              <CardContent className="pt-5">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold text-red-600 dark:text-red-400">{t.defaultWarning}</h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {t.defaultWarning1}
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {t.defaultWarning2}
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {t.defaultWarning3}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Button onClick={() => setStep(3)} className="mt-4 w-full" size="lg" variant="destructive">
              {t.iUnderstand} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* Step 4: Confirmation */}
        {step === 3 && (
          <motion.div key="confirm" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <h2 className="text-xl font-bold">{t.borrowSuccess}</h2>
                <p className="text-sm text-muted-foreground">{t.redirecting}</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardContent className="pt-5">
                    <h3 className="mb-4 text-sm font-semibold">{t.confirmLoan}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.principal}</span>
                        <span className="font-mono font-semibold">${parsedAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.interest}</span>
                        <span className="font-mono">${interestAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.insuranceFee}</span>
                        <span className="font-mono">${insuranceFee.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>{t.totalDue}</span>
                        <span className="font-mono">${totalDue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.dueDate}</span>
                        <span className="font-mono">{dueDate.toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.tier}</span>
                        <span className="font-mono" style={{ color: tierColor }}>{tier.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <TxButton
                  onClick={handleSubmit}
                  loading={submitting}
                  disabled={!circuitBreaker.canCreateLoan}
                  className="mt-4 w-full"
                >
                  {t.confirmBorrow}
                </TxButton>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
