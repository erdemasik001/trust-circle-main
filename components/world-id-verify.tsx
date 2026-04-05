"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface WorldIdProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
}

interface WorldIdVerifyProps {
  onSuccess: (proof: WorldIdProof) => void;
  onError?: (error: string) => void;
  buttonText?: string;
}

const MOCK_PROOF: WorldIdProof = {
  merkle_root: "0x" + "0".repeat(64),
  nullifier_hash: "0x" + "f39Fd6e51aad88F6F4ce6aB8827279cffFb92266".padEnd(64, "0"),
  proof: "0x" + "0".repeat(512),
  verification_level: "orb",
};

export function WorldIdVerifyButton({
  onSuccess,
  buttonText = "Verify with World ID",
}: WorldIdVerifyProps) {
  const [state, setState] = useState<"idle" | "scanning" | "verified">("idle");

  const handleVerify = () => {
    setState("scanning");
    // Simulate verification flow
    setTimeout(() => {
      setState("verified");
      setTimeout(() => {
        onSuccess(MOCK_PROOF);
      }, 1200);
    }, 2000);
  };

  return (
    <>
      <Button
        onClick={handleVerify}
        disabled={state !== "idle"}
        className="w-full max-w-xs"
        size="lg"
      >
        {state === "idle" && (
          <>
            <Shield className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
        {state === "scanning" && (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        )}
        {state === "verified" && (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verified!
          </>
        )}
      </Button>

      {/* Popup overlay */}
      <AnimatePresence>
        {(state === "scanning" || state === "verified") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="mx-6 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                {/* World ID Logo */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                  <Shield className="h-8 w-8 text-white" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-gray-900">
                  World ID
                </h3>

                {state === "scanning" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p className="text-sm text-gray-500">
                      Verifying your identity...
                    </p>

                    {/* Scanning animation */}
                    <div className="relative flex h-24 w-24 items-center justify-center">
                      <motion.div
                        className="absolute h-full w-full rounded-full border-4 border-blue-200"
                        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute h-3/4 w-3/4 rounded-full border-4 border-blue-300"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.2, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      />
                      <motion.div
                        className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600"
                        animate={{ scale: [0.9, 1.05, 0.9] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Proof of personhood
                    </div>
                  </motion.div>
                )}

                {state === "verified" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p className="text-sm text-gray-500">
                      Identity confirmed
                    </p>

                    {/* Success animation */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                      >
                        <CheckCircle2 className="h-14 w-14 text-green-500" />
                      </motion.div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-base font-semibold text-green-600"
                    >
                      Verified
                    </motion.p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
