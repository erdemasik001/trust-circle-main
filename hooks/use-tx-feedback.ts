"use client";

import { useCallback } from "react";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { useToast } from "@/components/ui/toast";

interface TxOptions {
  loadingMsg?: string;
  successMsg?: string;
  errorMsg?: string;
}

export function useTxFeedback() {
  const { toast, update } = useToast();
  const { isAuthenticated } = useWalletAuth();

  const withFeedback = useCallback(
    async <T>(fn: () => Promise<T>, opts: TxOptions = {}): Promise<T | null> => {
      const {
        loadingMsg = "Processing transaction...",
        successMsg = "Transaction successful!",
        errorMsg = "Transaction failed",
      } = opts;

      if (!isAuthenticated) {
        toast("Sign in first", "warning");
        return null;
      }

      const toastId = toast(loadingMsg, "loading");

      try {
        const result = await fn();
        update(toastId, successMsg, "success");
        return result;
      } catch (err) {
        const raw = err instanceof Error ? err.message : "";
        let message: string;
        if (raw.includes("User rejected") || raw.includes("user rejected") || raw.includes("cancelled")) {
          message = "Transaction cancelled";
        } else {
          message = `${errorMsg}: ${raw.slice(0, 80)}`;
        }
        update(toastId, message, "error");
        return null;
      }
    },
    [toast, update, isAuthenticated],
  );

  return { withFeedback, toast };
}
