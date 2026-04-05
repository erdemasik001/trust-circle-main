"use client";

import { useCallback, useMemo } from "react";
import { useReadContract } from "wagmi";
import { parseUnits, encodeFunctionData } from "viem";
import { MiniKit } from "@worldcoin/minikit-js";
import { worldChainSepolia } from "@/lib/chains";
import { CONTRACTS, TRUST_CIRCLE_ABI, TRUST_CIRCLE_ENS_ABI, ERC20_ABI } from "@/lib/contracts";
import { useTxFeedback } from "@/hooks/use-tx-feedback";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { getTierForRep } from "@/lib/tiers";
import { getVoucherMultiplier } from "@/constants/mock-data";
import {
  MOCK_USER,
  MOCK_ACTIVE_LOAN,
  MOCK_VOUCHES_RECEIVED,
  type MockVouch,
  type MockLoan,
} from "@/constants/mock-data";

// ─── Types ──────────────────────────────────────────────────

export interface UserProfile {
  address: string;
  ensName: string | null;
  reputationScore: number;
  effectiveRep: number;
  verified: boolean;
  isFrozen: boolean;
  memberSince: string;
  defaultCooldownUntil: number;
  activeVouchCount: number;
  loansRepaid: number;
  loansDefaulted: number;
  totalBorrowed: number;
  totalVouched: number;
  activeLoanId: number;
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
  revokeVouch: (borrowerAddress: string) => Promise<void>;
  liquidate: (borrowerAddress: string) => Promise<void>;
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

// On-chain return types
interface ProfileView {
  isRegistered: boolean;
  reputationScore: bigint;
  effectiveRep: bigint;
  totalVouchesReceived: bigint;
  totalBorrowed: bigint;
  registeredAt: bigint;
  activeLoan: bigint;
  activeVouchCount: bigint;
  frozen: boolean;
}

type ActiveLoanTuple = [bigint, bigint, bigint, bigint, bigint, bigint, number];

// ─── MiniKit TX Helper ─────────────────────────────────────

async function sendTx(calls: Array<{
  address: string;
  abi: readonly unknown[];
  functionName: string;
  args: unknown[];
}>) {
  if (MiniKit.isInstalled()) {
    // Encode each call to calldata (MiniKit v2 requires CalldataTransaction)
    const transactions = calls.map((call) => ({
      to: call.address,
      data: encodeFunctionData({
        abi: call.abi as readonly unknown[],
        functionName: call.functionName,
        args: call.args as readonly unknown[],
      }),
    }));

    const result = await MiniKit.sendTransaction({
      transactions,
      chainId: worldChainSepolia.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = (result as any).data ?? result;
    if (data.status === "error") {
      throw new Error(data.error_code ?? "Transaction failed");
    }
    return data;
  }

  // Outside World App — mock
  console.log("[TrustCircle] Mock TX:", calls.map((t) => t.functionName));
  await new Promise((r) => setTimeout(r, 2000));
  return { userOpHash: "0x" + "m".repeat(64), status: "success", mock: true };
}

// ─── Hook ───────────────────────────────────────────────────

export function useTrustCircle(): UseTrustCircleReturn {
  const { address, isAuthenticated } = useWalletAuth();
  const { withFeedback } = useTxFeedback();

  const userAddress = address as `0x${string}` | undefined;

  // ── On-chain reads (wagmi — RPC only, no wallet needed) ──
  const { data: onChainProfile, isLoading: profileLoading } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getUserProfile",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: onChainLoan, isLoading: loanLoading } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getActiveLoan",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: onChainLimit, isLoading: limitLoading } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getAvailableLimit",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  const { data: ensProfile } = useReadContract({
    address: CONTRACTS.trustCircleENS,
    abi: TRUST_CIRCLE_ENS_ABI,
    functionName: "getProfile",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // ── Parse on-chain data ───────────────────────────────
  const userProfile = useMemo<UserProfile | null>(() => {
    if (!isAuthenticated || !address) {
      return {
        address: MOCK_USER.address,
        ensName: MOCK_USER.ensName,
        reputationScore: MOCK_USER.reputationScore,
        effectiveRep: MOCK_USER.reputationScore,
        verified: MOCK_USER.verified,
        isFrozen: MOCK_USER.reputationScore < 100,
        memberSince: MOCK_USER.memberSince,
        defaultCooldownUntil: MOCK_USER.defaultCooldownUntil,
        activeVouchCount: MOCK_USER.activeVouchCount,
        loansRepaid: MOCK_USER.loansRepaid,
        loansDefaulted: MOCK_USER.loansDefaulted,
        totalBorrowed: MOCK_USER.totalBorrowed,
        totalVouched: MOCK_USER.totalVouched,
        activeLoanId: 0,
      };
    }

    if (!onChainProfile) return null;

    const p = onChainProfile as unknown as ProfileView;

    let ensName: string | null = null;
    if (ensProfile) {
      const [, fullName, , hasSubname] = ensProfile as unknown as [string, string, string, boolean];
      ensName = hasSubname ? fullName : null;
    }

    return {
      address,
      ensName,
      reputationScore: Number(p.reputationScore),
      effectiveRep: Number(p.effectiveRep),
      verified: p.isRegistered,
      isFrozen: p.frozen,
      memberSince: p.registeredAt
        ? new Date(Number(p.registeredAt) * 1000).toISOString()
        : "",
      defaultCooldownUntil: 0,
      activeVouchCount: Number(p.activeVouchCount),
      loansRepaid: 0,
      loansDefaulted: 0,
      totalBorrowed: Number(p.totalBorrowed) / 1e6,
      totalVouched: Number(p.totalVouchesReceived) / 1e6,
      activeLoanId: Number(p.activeLoan),
    };
  }, [isAuthenticated, address, onChainProfile, ensProfile]);

  const activeLoan = useMemo<MockLoan | null>(() => {
    if (!isAuthenticated || !onChainLoan) {
      return MOCK_ACTIVE_LOAN;
    }

    const l = onChainLoan as unknown as ActiveLoanTuple;
    const [loanId, principal, totalDue, amountRepaid, dueDate, gracePeriodEnd, status] = l;

    if (Number(loanId) === 0 && status === 0) return null;

    const statusMap: Record<number, MockLoan["status"]> = {
      0: "Active", 1: "Active", 2: "Repaid", 3: "Defaulted",
    };

    return {
      id: `loan-${Number(loanId).toString().padStart(3, "0")}`,
      borrower: address ?? "",
      principal: Number(principal) / 1e6,
      interestRate: 0,
      totalDue: Number(totalDue) / 1e6,
      amountRepaid: Number(amountRepaid) / 1e6,
      borrowedAt: "",
      dueDate: new Date(Number(dueDate) * 1000).toISOString(),
      gracePeriodEnd: new Date(Number(gracePeriodEnd) * 1000).toISOString(),
      status: statusMap[status] ?? "Active",
      insuranceContribution: 0,
      vouchers: [],
      voucherAmounts: [],
    };
  }, [isAuthenticated, address, onChainLoan]);

  const availableLimit = useMemo<AvailableLimit>(() => {
    if (!isAuthenticated || !onChainLimit) {
      return computeAvailableLimit(MOCK_VOUCHES_RECEIVED, MOCK_USER.reputationScore);
    }
    const [limit, voucherCount] = onChainLimit as unknown as [bigint, bigint];
    return { limit: Number(limit) / 1e6, voucherCount: Number(voucherCount) };
  }, [isAuthenticated, onChainLimit]);

  // ── Actions (MiniKit.sendTransaction with feedback) ───
  const register = useCallback(async (proof: WorldIdProof) => {
    await withFeedback(async () => {
      const proofArray = [];
      const proofHex = proof.proof.replace("0x", "");
      for (let i = 0; i < 8; i++) {
        proofArray.push(BigInt("0x" + proofHex.slice(i * 64, (i + 1) * 64)));
      }

      await sendTx([{
        address: CONTRACTS.trustCircle,
        abi: TRUST_CIRCLE_ABI,
        functionName: "registerWithWorldID",
        args: [
          BigInt(proof.merkle_root),
          BigInt(proof.nullifier_hash),
          proofArray,
        ],
      }]);
    }, { loadingMsg: "Registering with World ID...", successMsg: "Registration successful!", errorMsg: "Registration failed" });
  }, [withFeedback]);

  const vouch = useCallback(async (borrowerAddress: string, amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      // MiniKit supports batched transactions — approve + vouch in one
      await sendTx([
        {
          address: CONTRACTS.mockUSDC,
          abi: ERC20_ABI as unknown as readonly unknown[],
          functionName: "approve",
          args: [CONTRACTS.trustCircle, amountWei],
        },
        {
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          functionName: "vouchForUser",
          args: [borrowerAddress, amountWei],
        },
      ]);
    }, { loadingMsg: `Vouching $${amount} USDC...`, successMsg: `Vouched $${amount} USDC! Activates in 48h.`, errorMsg: "Vouch failed" });
  }, [withFeedback]);

  const borrow = useCallback(async (amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      await sendTx([{
        address: CONTRACTS.trustCircle,
        abi: TRUST_CIRCLE_ABI,
        functionName: "borrow",
        args: [amountWei],
      }]);
    }, { loadingMsg: `Borrowing $${amount} USDC...`, successMsg: `Borrowed $${amount} USDC successfully!`, errorMsg: "Borrow failed" });
  }, [withFeedback]);

  const repay = useCallback(async (amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      // Batched: approve + repay
      await sendTx([
        {
          address: CONTRACTS.mockUSDC,
          abi: ERC20_ABI as unknown as readonly unknown[],
          functionName: "approve",
          args: [CONTRACTS.trustCircle, amountWei],
        },
        {
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          functionName: "repayLoan",
          args: [amountWei],
        },
      ]);
    }, { loadingMsg: `Repaying $${amount} USDC...`, successMsg: `Repaid $${amount} USDC!`, errorMsg: "Repayment failed" });
  }, [withFeedback]);

  const revokeVouch = useCallback(async (borrowerAddress: string) => {
    await withFeedback(async () => {
      await sendTx([{
        address: CONTRACTS.trustCircle,
        abi: TRUST_CIRCLE_ABI,
        functionName: "revokeVouch",
        args: [borrowerAddress],
      }]);
    }, { loadingMsg: "Revoking vouch...", successMsg: "Vouch revoked!", errorMsg: "Revoke failed" });
  }, [withFeedback]);

  const liquidate = useCallback(async (borrowerAddress: string) => {
    await withFeedback(async () => {
      await sendTx([{
        address: CONTRACTS.trustCircle,
        abi: TRUST_CIRCLE_ABI,
        functionName: "liquidateDefaultedLoan",
        args: [borrowerAddress],
      }]);
    }, { loadingMsg: "Liquidating defaulted loan...", successMsg: "Loan liquidated! Bounty earned.", errorMsg: "Liquidation failed" });
  }, [withFeedback]);

  const actions: TrustCircleActions = useMemo(
    () => ({ register, vouch, borrow, repay, revokeVouch, liquidate }),
    [register, vouch, borrow, repay, revokeVouch, liquidate],
  );

  return {
    userProfile,
    activeLoan,
    availableLimit,
    vouchesReceived: MOCK_VOUCHES_RECEIVED,
    vouchesGiven: [],
    actions,
    isLoading: profileLoading || loanLoading || limitLoading,
    error: null,
  };
}
