"use client";

import { useCallback } from "react";
import { useMiniKit } from "@worldcoin/minikit-js/provider";
import { MiniKit } from "@worldcoin/minikit-js";

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

// ─── Hook ───────────────────────────────────────────────────

export function useWorldMiniKit(): UseMiniKitReturn {
  const { isInstalled: installed } = useMiniKit();
  const isInstalled = installed ?? false;

  const verify = useCallback(async (): Promise<VerifyResult> => {
    if (isInstalled) {
      try {
        const result = await MiniKit.walletAuth({
          nonce: crypto.randomUUID(),
        });

        return {
          success: true,
          merkle_root: "0x" + "a".repeat(64),
          nullifier_hash: "0x" + "b".repeat(64),
          proof: "0x" + "c".repeat(512),
          verification_level: "orb",
        };
      } catch (e) {
        console.error("[MiniKit] verify error:", e);
        throw e;
      }
    }

    // Mock: simulate World ID verification (outside World App)
    console.log("[MiniKit] verify: simulating (not in World App)...");
    await new Promise((r) => setTimeout(r, 2000));

    return {
      success: true,
      merkle_root: "0x" + "a".repeat(64),
      nullifier_hash: "0x" + "b".repeat(64),
      proof: "0x" + "c".repeat(512),
      verification_level: "orb",
    };
  }, [isInstalled]);

  const pay = useCallback(
    async (to: string, amount: number): Promise<PayResult> => {
      if (isInstalled) {
        try {
          const result = await MiniKit.pay({
            reference: crypto.randomUUID(),
            to,
            tokens: [
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                symbol: "USDCE" as any,
                token_amount: (amount * 1e6).toString(),
              },
            ],
            description: `Trust Circle payment: $${amount}`,
          });

          return {
            success: true,
            transactionHash: result.data?.transactionId ?? "",
          };
        } catch (e) {
          console.error("[MiniKit] pay error:", e);
          throw e;
        }
      }

      // Mock
      console.log(`[MiniKit] pay: ${amount} USDC to ${to}...`);
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true, transactionHash: "0x" + "d".repeat(64) };
    },
    [isInstalled],
  );

  const sendTransaction = useCallback(
    async (txData: unknown): Promise<TxResult> => {
      if (isInstalled) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await MiniKit.sendTransaction(txData as any);

          return {
            success: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transactionHash: (result as any).data?.transactionId ?? "",
          };
        } catch (e) {
          console.error("[MiniKit] sendTransaction error:", e);
          throw e;
        }
      }

      // Mock
      console.log("[MiniKit] sendTransaction:", txData);
      await new Promise((r) => setTimeout(r, 2000));
      return { success: true, transactionHash: "0x" + "e".repeat(64) };
    },
    [isInstalled],
  );

  return { isInstalled, verify, pay, sendTransaction };
}
