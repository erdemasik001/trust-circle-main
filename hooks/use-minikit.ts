"use client";

import { useState, useCallback, useMemo } from "react";

// ─── Types ──────────────────────────────────────────────────

export interface VerifyResult {
  success: boolean;
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
}

export interface PayResult {
  success: boolean;
  transactionHash: string;
}

export interface TxResult {
  success: boolean;
  transactionHash: string;
}

export interface UseMiniKitReturn {
  isInstalled: boolean;
  verify: () => Promise<VerifyResult>;
  pay: (to: string, amount: number) => Promise<PayResult>;
  sendTransaction: (txData: unknown) => Promise<TxResult>;
}

// ─── Helpers ────────────────────────────────────────────────

function simulateDelay(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMiniKit(): { isInstalled: () => boolean } | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  if (win.MiniKit) return win.MiniKit;
  return null;
}

// ─── Hook ───────────────────────────────────────────────────

export function useMiniKit(): UseMiniKitReturn {
  const isInstalled = useMemo(() => {
    const mk = getMiniKit();
    return mk ? mk.isInstalled() : false;
  }, []);

  const verify = useCallback(async (): Promise<VerifyResult> => {
    const mk = getMiniKit();

    if (mk && isInstalled) {
      // TODO: real MiniKit.commandsAsync.verify flow
      // const result = await MiniKit.commandsAsync.verify({ ... });
      // return result;
    }

    // Mock: simulate World ID verification
    console.log("[MiniKit] verify: simulating World ID verification...");
    await simulateDelay();
    console.log("[MiniKit] verify: complete");

    return {
      success: true,
      merkle_root: "0x" + "a".repeat(64),
      nullifier_hash: "0x" + "b".repeat(64),
      proof: "0x" + "c".repeat(256),
      verification_level: "orb",
    };
  }, [isInstalled]);

  const pay = useCallback(
    async (to: string, amount: number): Promise<PayResult> => {
      const mk = getMiniKit();

      if (mk && isInstalled) {
        // TODO: real MiniKit.commandsAsync.pay flow
        // const result = await MiniKit.commandsAsync.pay({ ... });
        // return result;
      }

      // Mock: simulate payment
      console.log(`[MiniKit] pay: ${amount} USDC to ${to}...`);
      await simulateDelay();
      console.log("[MiniKit] pay: complete");

      return {
        success: true,
        transactionHash: "0x" + "d".repeat(64),
      };
    },
    [isInstalled],
  );

  const sendTransaction = useCallback(
    async (txData: unknown): Promise<TxResult> => {
      const mk = getMiniKit();

      if (mk && isInstalled) {
        // TODO: real MiniKit.commandsAsync.sendTransaction flow
        // const result = await MiniKit.commandsAsync.sendTransaction({ ... });
        // return result;
      }

      // Mock: simulate transaction
      console.log("[MiniKit] sendTransaction:", txData);
      await simulateDelay();
      console.log("[MiniKit] sendTransaction: complete");

      return {
        success: true,
        transactionHash: "0x" + "e".repeat(64),
      };
    },
    [isInstalled],
  );

  return {
    isInstalled,
    verify,
    pay,
    sendTransaction,
  };
}
