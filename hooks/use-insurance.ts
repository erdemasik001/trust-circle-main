"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, INSURANCE_POOL_ABI } from "@/lib/contracts";

export interface UseInsuranceReturn {
  poolBalance: number;
  totalContributions: number;
  totalPayouts: number;
  coverageRate: number;
  isLoading: boolean;
}

export function useInsurance(): UseInsuranceReturn {
  const { isConnected } = useAccount();

  const { data: stats, isLoading } = useReadContract({
    address: CONTRACTS.insurancePool,
    abi: INSURANCE_POOL_ABI,
    functionName: "getStats",
    query: { enabled: isConnected },
  });

  return useMemo(() => {
    if (!isConnected || !stats) {
      return {
        poolBalance: 0,
        totalContributions: 0,
        totalPayouts: 0,
        coverageRate: 0,
        isLoading: isConnected ? isLoading : false,
      };
    }

    const [balance, contributions, coveragePaid, bountiesPaid] = stats as unknown as [bigint, bigint, bigint, bigint];

    return {
      poolBalance: Number(balance) / 1e6,
      totalContributions: Number(contributions) / 1e6,
      totalPayouts: (Number(coveragePaid) + Number(bountiesPaid)) / 1e6,
      coverageRate: Number(contributions) > 0
        ? Math.round((Number(coveragePaid) / Number(contributions)) * 100)
        : 0,
      isLoading,
    };
  }, [isConnected, stats, isLoading]);
}
