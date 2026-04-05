"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS, CIRCUIT_BREAKER_ABI } from "@/lib/contracts";
import { type SystemHealthStatus } from "@/types";

export interface UseCircuitBreakerReturn {
  health: SystemHealthStatus;
  canCreateLoan: boolean;
  activeLoans: number;
  defaultRate: number;
  isLoading: boolean;
}

const healthMap: Record<number, SystemHealthStatus> = {
  0: "GREEN",
  1: "YELLOW",
  2: "RED",
  3: "RECOVERY",
};

export function useCircuitBreaker(): UseCircuitBreakerReturn {
  const { isConnected } = useAccount();

  const { data: healthRaw, isLoading: healthLoading } = useReadContract({
    address: CONTRACTS.circuitBreaker,
    abi: CIRCUIT_BREAKER_ABI,
    functionName: "getHealth",
    query: { enabled: isConnected },
  });

  const { data: canCreate, isLoading: canCreateLoading } = useReadContract({
    address: CONTRACTS.circuitBreaker,
    abi: CIRCUIT_BREAKER_ABI,
    functionName: "canCreateLoan",
    query: { enabled: isConnected },
  });

  const { data: statsRaw } = useReadContract({
    address: CONTRACTS.circuitBreaker,
    abi: CIRCUIT_BREAKER_ABI,
    functionName: "getStats",
    query: { enabled: isConnected },
  });

  return useMemo(() => {
    if (!isConnected || healthRaw === undefined) {
      return {
        health: "GREEN" as SystemHealthStatus,
        canCreateLoan: true,
        activeLoans: 0,
        defaultRate: 0,
        isLoading: isConnected ? (healthLoading || canCreateLoading) : false,
      };
    }

    const stats = statsRaw as unknown as [bigint, bigint, bigint, bigint] | undefined;

    return {
      health: healthMap[Number(healthRaw)] ?? "GREEN",
      canCreateLoan: canCreate as boolean ?? true,
      activeLoans: stats ? Number(stats[0]) : 0,
      defaultRate: stats && Number(stats[1]) > 0
        ? Math.round((Number(stats[2]) / Number(stats[1])) * 100 * 10) / 10
        : 0,
      isLoading: healthLoading || canCreateLoading,
    };
  }, [isConnected, healthRaw, canCreate, statsRaw, healthLoading, canCreateLoading]);
}
