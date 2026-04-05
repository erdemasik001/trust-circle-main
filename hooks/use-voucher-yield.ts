"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACTS, TRUST_CIRCLE_ABI } from "@/lib/contracts";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { VOUCHER_YIELD_PERCENT } from "@/lib/constants";

export interface VoucherYieldInfo {
  totalYieldEarned: number;
  pendingYield: number;
  yieldSharePercent: number;
  yieldEvents: Array<{
    loanId: number;
    principal: number;
    yieldAmount: number;
  }>;
}

/**
 * Reads YieldDistributed events from on-chain to calculate
 * actual voucher earnings.
 *
 * Event: YieldDistributed(loanId indexed, voucher indexed, principal, yield)
 */
export function useVoucherYield(
  vouchesGiven: Array<{ amount: number; usedAmount: number; isActive: boolean }>,
  activeLoanInterest: number,
): VoucherYieldInfo {
  const { address, isAuthenticated } = useWalletAuth();
  const publicClient = usePublicClient();
  const userAddress = address as `0x${string}` | undefined;

  const [yieldData, setYieldData] = useState<VoucherYieldInfo>({
    totalYieldEarned: 0,
    pendingYield: 0,
    yieldSharePercent: VOUCHER_YIELD_PERCENT,
    yieldEvents: [],
  });

  useEffect(() => {
    if (!publicClient || !userAddress || !isAuthenticated) {
      // Calculate estimated yield from active vouches as fallback
      const totalUsed = vouchesGiven.reduce((sum, v) => sum + v.usedAmount, 0);
      const totalVouched = vouchesGiven.reduce((sum, v) => sum + v.amount, 0);
      const pendingYield = totalUsed > 0
        ? (activeLoanInterest * VOUCHER_YIELD_PERCENT / 100) * (totalUsed / Math.max(totalVouched, 1))
        : 0;

      setYieldData({
        totalYieldEarned: 0,
        pendingYield: Math.round(pendingYield * 100) / 100,
        yieldSharePercent: VOUCHER_YIELD_PERCENT,
        yieldEvents: [],
      });
      return;
    }

    const fetchYield = async () => {
      try {
        const events = await publicClient.getContractEvents({
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          eventName: "YieldDistributed",
          args: { voucher: userAddress },
          fromBlock: BigInt(0),
        });

        const yieldEvents = events.map((e) => {
          const args = e.args as {
            loanId?: bigint;
            principal?: bigint;
            yield?: bigint;
          };
          return {
            loanId: Number(args.loanId ?? BigInt(0)),
            principal: Number(args.principal ?? BigInt(0)) / 1e6,
            yieldAmount: Number(args.yield ?? BigInt(0)) / 1e6,
          };
        });

        const totalYieldEarned = yieldEvents.reduce((sum, e) => sum + e.yieldAmount, 0);

        // Pending yield: estimate from active vouches backing active loans
        const totalUsed = vouchesGiven.reduce((sum, v) => sum + v.usedAmount, 0);
        const totalVouched = vouchesGiven.reduce((sum, v) => sum + v.amount, 0);
        const pendingYield = totalUsed > 0
          ? (activeLoanInterest * VOUCHER_YIELD_PERCENT / 100) * (totalUsed / Math.max(totalVouched, 1))
          : 0;

        setYieldData({
          totalYieldEarned: Math.round(totalYieldEarned * 100) / 100,
          pendingYield: Math.round(pendingYield * 100) / 100,
          yieldSharePercent: VOUCHER_YIELD_PERCENT,
          yieldEvents,
        });
      } catch (err) {
        console.error("[VoucherYield] Error fetching events:", err);
      }
    };

    fetchYield();
  }, [publicClient, userAddress, isAuthenticated, vouchesGiven, activeLoanInterest]);

  return yieldData;
}
