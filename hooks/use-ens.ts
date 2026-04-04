"use client";

import { useState, useCallback, useMemo } from "react";
import { MOCK_USER } from "@/constants/mock-data";

// Toggle between mock and real (wagmi) data
const USE_MOCK = true;

// ─── Types ──────────────────────────────────────────────────

export interface UseENSReturn {
  ensName: string | null;
  isAvailable: (name: string) => Promise<boolean>;
  claimName: (name: string) => Promise<void>;
  resolve: (name: string) => Promise<string | null>;
  isLoading: boolean;
}

// ─── Helpers ────────────────────────────────────────────────

function simulateDelay(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Hook ───────────────────────────────────────────────────

export function useENS(userAddress?: string): UseENSReturn {
  const [isLoading, setIsLoading] = useState(false);

  // ── Mock ENS name ──────────────────────────────────────

  const ensName = useMemo(() => {
    if (USE_MOCK) {
      return userAddress === MOCK_USER.address || !userAddress
        ? MOCK_USER.ensName
        : null;
    }
    // TODO: wagmi useEnsName hook
    return null;
  }, [userAddress]);

  // ── Actions ────────────────────────────────────────────

  const isAvailable = useCallback(async (name: string): Promise<boolean> => {
    if (USE_MOCK) {
      console.log(`[ENS] isAvailable: ${name}.trustcircle.eth`);
      await simulateDelay(500);
      return true;
    }
    // TODO: real ENS availability check via contract read
    return false;
  }, []);

  const claimName = useCallback(async (name: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log(`[ENS] claimName: ${name}.trustcircle.eth`);
      await simulateDelay();
      console.log(`[ENS] claimName complete: ${name}.trustcircle.eth`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolve = useCallback(async (name: string): Promise<string | null> => {
    if (USE_MOCK) {
      console.log(`[ENS] resolve: ${name}`);
      await simulateDelay(500);
      // Return mock address for known names
      if (name === MOCK_USER.ensName) {
        return MOCK_USER.address;
      }
      return "0x0000000000000000000000000000000000000000";
    }
    // TODO: real ENS resolution
    return null;
  }, []);

  return {
    ensName,
    isAvailable,
    claimName,
    resolve,
    isLoading,
  };
}
