"use client";

import { useMemo } from "react";
import { MOCK_SYSTEM_HEALTH, type SystemHealthStatus } from "@/constants/mock-data";

// Toggle between mock and real (wagmi) data
const USE_MOCK = true;

// ─── Types ──────────────────────────────────────────────────

export interface UseCircuitBreakerReturn {
  health: SystemHealthStatus;
  canCreateLoan: boolean;
  activeLoans: number;
  defaultRate: number;
  isLoading: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

function canCreateLoanForHealth(status: SystemHealthStatus): boolean {
  return status === "GREEN" || status === "YELLOW";
}

// ─── Hook ───────────────────────────────────────────────────

export function useCircuitBreaker(): UseCircuitBreakerReturn {
  // TODO: wagmi read hooks for real mode
  // const { data: cbState, isLoading } = useReadContract({ ... });

  const mockData = useMemo<UseCircuitBreakerReturn>(
    () => ({
      health: MOCK_SYSTEM_HEALTH.status,
      canCreateLoan: canCreateLoanForHealth(MOCK_SYSTEM_HEALTH.status),
      activeLoans: MOCK_SYSTEM_HEALTH.activeLoansCount,
      defaultRate: MOCK_SYSTEM_HEALTH.defaultRate,
      isLoading: false,
    }),
    [],
  );

  if (USE_MOCK) {
    return mockData;
  }

  // Real mode placeholder
  return {
    health: "GREEN",
    canCreateLoan: true,
    activeLoans: 0,
    defaultRate: 0,
    isLoading: false,
  };
}
