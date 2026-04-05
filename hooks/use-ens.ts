"use client";

import { useState, useCallback, useMemo } from "react";
import { useReadContract } from "wagmi";
import { createPublicClient, http, encodeFunctionData } from "viem";
import { MiniKit } from "@worldcoin/minikit-js";
import { CONTRACTS, TRUST_CIRCLE_ENS_ABI } from "@/lib/contracts";
import { useTxFeedback } from "@/hooks/use-tx-feedback";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { worldChainSepolia } from "@/lib/chains";
import { MOCK_USER } from "@/constants/mock-data";

export interface UseENSReturn {
  ensName: string | null;
  isAvailable: (name: string) => Promise<boolean>;
  claimName: (name: string) => Promise<void>;
  setTextRecord: (key: string, value: string) => Promise<void>;
  resolve: (name: string) => Promise<string | null>;
  isLoading: boolean;
}

export function useENS(userAddress?: string): UseENSReturn {
  const { address, isAuthenticated } = useWalletAuth();
  const { withFeedback } = useTxFeedback();
  const [isLoading, setIsLoading] = useState(false);

  const resolvedAddress = (userAddress ?? address) as `0x${string}` | undefined;

  // Read on-chain ENS profile
  const { data: ensProfile } = useReadContract({
    address: CONTRACTS.trustCircleENS,
    abi: TRUST_CIRCLE_ENS_ABI,
    functionName: "getProfile",
    args: resolvedAddress ? [resolvedAddress] : undefined,
    query: { enabled: !!resolvedAddress && isAuthenticated },
  });

  const ensName = useMemo(() => {
    if (!isAuthenticated || !ensProfile) {
      return MOCK_USER.ensName;
    }
    const [, fullName, , hasSubname] = ensProfile as unknown as [string, string, string, boolean];
    return hasSubname ? fullName : null;
  }, [isAuthenticated, ensProfile]);

  const isAvailable = useCallback(async (name: string): Promise<boolean> => {
    try {
      const client = createPublicClient({ chain: worldChainSepolia, transport: http() });
      const available = await client.readContract({
        address: CONTRACTS.trustCircleENS,
        abi: TRUST_CIRCLE_ENS_ABI,
        functionName: "isSubnameAvailable",
        args: [name],
      });
      return available as boolean;
    } catch {
      return true;
    }
  }, []);

  const claimName = useCallback(async (name: string): Promise<void> => {
    if (!isAuthenticated) {
      await new Promise((r) => setTimeout(r, 2000));
      return;
    }
    setIsLoading(true);
    try {
      await withFeedback(async () => {
        if (MiniKit.isInstalled()) {
          const result = await MiniKit.sendTransaction({
            transactions: [{
              to: CONTRACTS.trustCircleENS,
              data: encodeFunctionData({
                abi: TRUST_CIRCLE_ENS_ABI,
                functionName: "claimSubname",
                args: [name],
              }),
            }],
            chainId: worldChainSepolia.id,
          });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data = (result as any).data ?? result;
          if (data.status === "error") throw new Error(data.error_code);
        } else {
          console.log("[ENS] Mock claim:", name);
          await new Promise((r) => setTimeout(r, 2000));
        }
      }, {
        loadingMsg: `Claiming ${name}.trustcircle.eth...`,
        successMsg: `${name}.trustcircle.eth claimed!`,
        errorMsg: "Failed to claim name",
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, withFeedback]);

  const setTextRecord = useCallback(async (key: string, value: string): Promise<void> => {
    if (!isAuthenticated) return;
    await withFeedback(async () => {
      if (MiniKit.isInstalled()) {
        const result = await MiniKit.sendTransaction({
          transactions: [{
            to: CONTRACTS.trustCircleENS,
            data: encodeFunctionData({
              abi: TRUST_CIRCLE_ENS_ABI,
              functionName: "setTextRecord",
              args: [key, value],
            }),
          }],
          chainId: worldChainSepolia.id,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (result as any).data ?? result;
        if (data.status === "error") throw new Error(data.error_code);
      } else {
        console.log(`[ENS] Mock setTextRecord: ${key}=${value}`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }, {
      loadingMsg: `Setting ${key} record...`,
      successMsg: `${key} record updated!`,
      errorMsg: "Failed to set text record",
    });
  }, [isAuthenticated, withFeedback]);

  const resolve = useCallback(async (name: string): Promise<string | null> => {
    if (!isAuthenticated) {
      if (name === MOCK_USER.ensName) return MOCK_USER.address;
      return null;
    }
    try {
      const client = createPublicClient({ chain: worldChainSepolia, transport: http() });
      const resolved = await client.readContract({
        address: CONTRACTS.trustCircleENS,
        abi: TRUST_CIRCLE_ENS_ABI,
        functionName: "resolve",
        args: [name],
      });
      const addr = resolved as string;
      if (addr === "0x0000000000000000000000000000000000000000") return null;
      return addr;
    } catch {
      return null;
    }
  }, [isAuthenticated]);

  return { ensName, isAvailable, claimName, setTextRecord, resolve, isLoading };
}
