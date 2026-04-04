"use client";

import { useState, useCallback, useMemo } from "react";
import {
  MOCK_USER,
  MOCK_ACTIVE_LOAN,
  MOCK_VOUCHES_RECEIVED,
  type MockVouch,
  type MockLoan,
} from "@/constants/mock-data";
import { getTierForRep } from "@/lib/tiers";
import { getVoucherMultiplier } from "@/constants/mock-data";

// Toggle between mock and real (wagmi) data
const USE_MOCK = true;

// ─── Types ──────────────────────────────────────────────────

export interface UserProfile {
  address: string;
  ensName: string | null;
  reputationScore: number;
  verified: boolean;
  memberSince: string;
  lastActivityAt: string;
  defaultCooldownUntil: number;
  activeVouchCount: number;
  loansRepaid: number;
  loansDefaulted: number;
  totalBorrowed: number;
  totalVouched: number;
}

export interface AvailableLimit {
  limit: number;
  voucherCount: number;
}

export interface WorldIdProof {
  merkle_root: string;
  nullifier_hash: string;
  proof: string;
  verification_level: string;
}

export interface TrustCircleActions {
  register: (proof: WorldIdProof) => Promise<void>;
  vouch: (borrowerAddress: string, amount: number) => Promise<void>;
  borrow: (amount: number) => Promise<void>;
  repay: (amount: number) => Promise<void>;
  revokeVouch: (vouchId: string) => Promise<void>;
}

export interface UseTrustCircleReturn {
  userProfile: UserProfile | null;
  activeLoan: MockLoan | null;
  availableLimit: AvailableLimit;
  vouchesReceived: MockVouch[];
  vouchesGiven: MockVouch[];
  actions: TrustCircleActions;
  isLoading: boolean;
  error: Error | null;
}

// ─── Helpers ────────────────────────────────────────────────

function computeAvailableLimit(vouches: MockVouch[], rep: number): AvailableLimit {
  const activeVouches = vouches.filter((v) => v.isActive);
  const totalAvailable = activeVouches.reduce((sum, v) => {
    const multiplier = getVoucherMultiplier(v.voucher.reputationScore);
    return sum + (v.amount - v.usedAmount) * multiplier;
  }, 0);

  const tier = getTierForRep(rep);
  const limit = Math.min(totalAvailable, tier.maxBorrow);

  return { limit: Math.round(limit * 100) / 100, voucherCount: activeVouches.length };
}

function simulateDelay(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Mock vouches given (this user vouching for others) ─────

const MOCK_VOUCHES_GIVEN: MockVouch[] = [
  {
    id: "vg1",
    voucher: {
      address: MOCK_USER.address,
      ensName: MOCK_USER.ensName,
      reputationScore: MOCK_USER.reputationScore,
      verified: true,
    },
    amount: 50,
    usedAmount: 0,
    isActive: true,
    activatesAt: "2026-03-15T12:00:00Z",
    createdAt: "2026-03-13T12:00:00Z",
  },
];

// ─── Hook ───────────────────────────────────────────────────

export function useTrustCircle(userAddress?: string): UseTrustCircleReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ── Mock data ──────────────────────────────────────────

  const mockProfile: UserProfile = useMemo(
    () => ({
      address: userAddress ?? MOCK_USER.address,
      ensName: MOCK_USER.ensName,
      reputationScore: MOCK_USER.reputationScore,
      verified: MOCK_USER.verified,
      memberSince: MOCK_USER.memberSince,
      lastActivityAt: MOCK_USER.lastActivityAt,
      defaultCooldownUntil: MOCK_USER.defaultCooldownUntil,
      activeVouchCount: MOCK_USER.activeVouchCount,
      loansRepaid: MOCK_USER.loansRepaid,
      loansDefaulted: MOCK_USER.loansDefaulted,
      totalBorrowed: MOCK_USER.totalBorrowed,
      totalVouched: MOCK_USER.totalVouched,
    }),
    [userAddress],
  );

  const mockAvailableLimit = useMemo(
    () => computeAvailableLimit(MOCK_VOUCHES_RECEIVED, MOCK_USER.reputationScore),
    [],
  );

  // ── TODO: wagmi read hooks for real mode ───────────────
  // const { data: onChainProfile } = useReadContract({ ... });
  // const { data: onChainLoan } = useReadContract({ ... });

  // ── Actions (mock) ─────────────────────────────────────

  const register = useCallback(async (proof: WorldIdProof) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("[TrustCircle] register called with proof:", proof);
      await simulateDelay();
      console.log("[TrustCircle] register complete");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Registration failed"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const vouch = useCallback(async (borrowerAddress: string, amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[TrustCircle] vouch: ${amount} USDC for ${borrowerAddress}`);
      await simulateDelay();
      console.log("[TrustCircle] vouch complete");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Vouch failed"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const borrow = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[TrustCircle] borrow: ${amount} USDC`);
      await simulateDelay();
      console.log("[TrustCircle] borrow complete");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Borrow failed"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const repay = useCallback(async (amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[TrustCircle] repay: ${amount} USDC`);
      await simulateDelay();
      console.log("[TrustCircle] repay complete");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Repay failed"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const revokeVouch = useCallback(async (vouchId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`[TrustCircle] revokeVouch: ${vouchId}`);
      await simulateDelay();
      console.log("[TrustCircle] revokeVouch complete");
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Revoke vouch failed"));
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const actions: TrustCircleActions = useMemo(
    () => ({ register, vouch, borrow, repay, revokeVouch }),
    [register, vouch, borrow, repay, revokeVouch],
  );

  // ── Return ─────────────────────────────────────────────

  if (USE_MOCK) {
    return {
      userProfile: mockProfile,
      activeLoan: MOCK_ACTIVE_LOAN,
      availableLimit: mockAvailableLimit,
      vouchesReceived: MOCK_VOUCHES_RECEIVED,
      vouchesGiven: MOCK_VOUCHES_GIVEN,
      actions,
      isLoading,
      error,
    };
  }

  // Real mode placeholder — wire up wagmi hooks here
  return {
    userProfile: null,
    activeLoan: null,
    availableLimit: { limit: 0, voucherCount: 0 },
    vouchesReceived: [],
    vouchesGiven: [],
    actions,
    isLoading,
    error,
  };
}
