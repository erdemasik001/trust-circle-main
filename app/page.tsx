"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { HandCoins, Shield, TrendingUp, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/language-context";
import { useWorldMiniKit } from "@/hooks/use-minikit";
import { useENS } from "@/hooks/use-ens";
import { useTrustCircle } from "@/hooks/use-trust-circle";

const slides = [
  {
    titleKey: "Credit without collateral",
    descKey: "Borrow USDC backed by people who trust you. No assets required.",
    Icon: HandCoins,
    color: "#60A5FA",
  },
  {
    titleKey: "Backed by trust",
    descKey: "Your community vouches for you. Their stake is your collateral.",
    Icon: Shield,
    color: "#34D399",
  },
  {
    titleKey: "Build your reputation",
    descKey: "Repay on time, earn reputation, unlock higher credit tiers.",
    Icon: TrendingUp,
    color: "#A78BFA",
  },
];

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [ensInput, setEnsInput] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const minikit = useWorldMiniKit();
  const ens = useENS();
  const { actions } = useTrustCircle();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(3);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Step 1: Get World ID proof via MiniKit
      const result = await minikit.verify();
      if (!result.success) throw new Error("MiniKit verification failed");

      // Step 2: Verify proof server-side
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merkle_root: result.merkle_root,
          nullifier_hash: result.nullifier_hash,
          proof: result.proof,
          verification_level: result.verification_level,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) throw new Error(verifyData.error ?? "Server verification failed");

      // Step 3: Register on-chain with the proof
      await actions.register({
        merkle_root: result.merkle_root,
        nullifier_hash: result.nullifier_hash,
        proof: result.proof,
        verification_level: result.verification_level,
      });

      setVerified(true);
      setTimeout(() => setCurrentStep(4), 800);
    } catch (err) {
      console.error("[Onboarding] Verify error:", err);
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async () => {
    if (!ensInput.trim()) return;
    try {
      await ens.claimName(ensInput);
      router.push("/dashboard");
    } catch {
      // claim failed
    }
  };

  const slideVariants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  };

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">{t.appName}</h1>
        {currentStep < 3 && (
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            {t.skip}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Slides 1-3 */}
          {currentStep < 3 && (
            <motion.div
              key={`slide-${currentStep}`}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <div
                className="mb-8 flex h-32 w-32 items-center justify-center rounded-full"
                style={{ backgroundColor: `${slides[currentStep].color}1A` }}
              >
                {(() => {
                  const Icon = slides[currentStep].Icon;
                  return <Icon className="h-14 w-14" style={{ color: slides[currentStep].color }} />;
                })()}
              </div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">
                {slides[currentStep].titleKey}
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                {slides[currentStep].descKey}
              </p>
            </motion.div>
          )}

          {/* Step 4: World ID Verification */}
          {currentStep === 3 && (
            <motion.div
              key="verify"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-blue-500/10">
                {verified ? (
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                ) : (
                  <Shield className="h-14 w-14 text-blue-500" />
                )}
              </div>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">
                {verified ? "Verified!" : "Verify Your Identity"}
              </h2>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {verified
                  ? "Your World ID has been verified successfully."
                  : t.disclaimer}
              </p>
              {!verified && (
                <>
                  <Button
                    onClick={() => { setVerifyError(null); handleVerify(); }}
                    disabled={verifying}
                    className="w-full max-w-xs"
                    size="lg"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      t.verifyWithWorldId
                    )}
                  </Button>
                  {verifyError && (
                    <p className="mt-3 text-sm text-red-500">{verifyError}</p>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Step 5: ENS Name Claim */}
          {currentStep === 4 && (
            <motion.div
              key="claim"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex w-full flex-col items-center text-center"
            >
              <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-violet-500/10">
                <span className="text-4xl font-bold text-violet-500">@</span>
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight">{t.claimName}</h2>
              <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t.claimNameDesc}
              </p>
              <div className="w-full max-w-xs">
                <div className="flex items-center rounded-lg border border-border bg-muted/50">
                  <Input
                    value={ensInput}
                    onChange={(e) => setEnsInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
                    placeholder="yourname"
                    className="border-0 bg-transparent text-right font-mono focus-visible:ring-0"
                  />
                  <span className="shrink-0 pr-3 font-mono text-sm text-muted-foreground">
                    .trustcircle.eth
                  </span>
                </div>
                <Button
                  onClick={handleClaim}
                  disabled={!ensInput.trim() || ens.isLoading}
                  className="mt-4 w-full"
                  size="lg"
                >
                  {ens.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    t.getStarted
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom: Dot indicators + Next button */}
      <div className="flex flex-col items-center gap-6 pb-4">
        {currentStep < 3 && (
          <Button onClick={handleNext} className="w-full max-w-xs" size="lg">
            {t.next}
          </Button>
        )}
        <div className="flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-6 bg-primary"
                  : i < currentStep
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
