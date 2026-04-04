"use client";

import { useMemo } from "react";
import { MOCK_SYSTEM_HEALTH } from "@/constants/mock-data";

// Toggle between mock and real (wagmi) data
const USE_MOCK = true;

// ─── Types ──────────────────────────────────────────────────

export interface UseInsuranceReturn {
  poolBalance: number;
  totalContributions: number;
  totalPayouts: number;
  coverageRate: number;
  isLoading: boolean;
}

// ─── Hook ───────────────────────────────────────────────────

export function useInsurance(): UseInsuranceReturn {
  // TODO: wagmi read hooks for real mode
  // const { data: poolBalance, isLoading: l1 } = useReadContract({ ... });
  // const { data: totalContributions, isLoading: l2 } = useReadContract({ ... });

  const mockData = useMemo<UseInsuranceReturn>(
    () => ({
      poolBalance: MOCK_SYSTEM_HEALTH.insurancePoolBalance,
      totalContributions: MOCK_SYSTEM_HEALTH.totalInsuranceContributions,
      totalPayouts: MOCK_SYSTEM_HEALTH.totalInsurancePayouts,
      coverageRate: MOCK_SYSTEM_HEALTH.coverageRate,
      isLoading: false,
    }),
    [],
  );

  if (USE_MOCK) {
    return mockData;
  }

  // Real mode placeholder
  return {
    poolBalance: 0,
    totalContributions: 0,
    totalPayouts: 0,
    coverageRate: 30,
    isLoading: false,
  };
}
