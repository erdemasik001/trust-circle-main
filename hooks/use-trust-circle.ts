"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useReadContract, usePublicClient } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseUnits, encodeFunctionData } from "viem";
import { MiniKit } from "@worldcoin/minikit-js";
import { worldChainSepolia } from "@/lib/chains";
import {
  CONTRACTS,
  TRUST_CIRCLE_ABI,
  TRUST_CIRCLE_ENS_ABI,
  ERC20_ABI,
} from "@/lib/contracts";
import { useTxFeedback } from "@/hooks/use-tx-feedback";
import { useWalletAuth } from "@/contexts/wallet-auth-context";
import { VOUCH_ACTIVATION_DELAY_HOURS } from "@/lib/constants";

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

export interface VouchData {
  id: string;
  voucher: {
    address: string;
    ensName: string;
    reputationScore: number;
    verified: boolean;
  };
  amount: number;
  usedAmount: number;
  isActive: boolean;
  activatesAt: string;
  createdAt: string;
}

export interface LoanData {
  id: string;
  borrower: string;
  principal: number;
  interestRate: number;
  totalDue: number;
  amountRepaid: number;
  borrowedAt: string;
  dueDate: string;
  gracePeriodEnd: string;
  status: "Active" | "Grace" | "Repaid" | "Defaulted";
  insuranceContribution: number;
  vouchers: string[];
  voucherAmounts: number[];
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
  activeLoan: LoanData | null;
  availableLimit: AvailableLimit;
  vouchesReceived: VouchData[];
  vouchesGiven: VouchData[];
  actions: TrustCircleActions;
  isLoading: boolean;
  error: Error | null;
}

// ─── On-chain return types ─────────────────────────────────

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
type VouchDetailsTuple = [bigint, bigint, boolean, bigint];

// ─── MiniKit TX Helper ─────────────────────────────────────

async function sendTx(
  calls: Array<{
    address: string;
    abi: readonly unknown[];
    functionName: string;
    args: unknown[];
  }>,
) {
  if (MiniKit.isInstalled()) {
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
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();

  const invalidateOnChainQueries = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const userAddress = address as `0x${string}` | undefined;

  // ── On-chain reads ─────────────────────────────────────
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

  // Voucher addresses that vouch FOR this user
  const { data: borrowerVoucherAddrs } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getBorrowerVouchers",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // Addresses this user has vouched FOR
  const { data: givenVouchAddrs } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getVouchesGivenTo",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // ── Fetch vouch details for each voucher ──────────────
  const [vouchesReceivedOnChain, setVouchesReceivedOnChain] = useState<VouchData[]>([]);
  const [vouchesGivenOnChain, setVouchesGivenOnChain] = useState<VouchData[]>([]);
  const [vouchesLoading, setVouchesLoading] = useState(false);

  useEffect(() => {
    if (!publicClient || !userAddress) return;

    const fetchVouchDetails = async () => {
      setVouchesLoading(true);
      try {
        // Fetch vouches received (people who vouch for me)
        const receivedAddrs = (borrowerVoucherAddrs as `0x${string}`[]) ?? [];
        const receivedPromises = receivedAddrs.map(async (voucherAddr, i) => {
          const [details, profile, ens] = await Promise.all([
            publicClient.readContract({
              address: CONTRACTS.trustCircle,
              abi: TRUST_CIRCLE_ABI,
              functionName: "getVouchDetails",
              args: [voucherAddr, userAddress],
            }) as Promise<VouchDetailsTuple>,
            publicClient.readContract({
              address: CONTRACTS.trustCircle,
              abi: TRUST_CIRCLE_ABI,
              functionName: "getUserProfile",
              args: [voucherAddr],
            }).catch(() => null),
            publicClient.readContract({
              address: CONTRACTS.trustCircleENS,
              abi: TRUST_CIRCLE_ENS_ABI,
              functionName: "getProfile",
              args: [voucherAddr],
            }).catch(() => null),
          ]);

          const [amount, usedAmount, isActive, activatesAt] = details;
          const p = profile as ProfileView | null;
          const e = ens as [string, string, string, boolean] | null;

          return {
            id: `vr-${i}`,
            voucher: {
              address: voucherAddr,
              ensName: e?.[3] ? e[1] : voucherAddr.slice(0, 10),
              reputationScore: p ? Number(p.reputationScore) : 0,
              verified: p ? p.isRegistered : false,
            },
            amount: Number(amount) / 1e6,
            usedAmount: Number(usedAmount) / 1e6,
            isActive,
            activatesAt: Number(activatesAt) > 0
              ? new Date(Number(activatesAt) * 1000).toISOString()
              : "",
            createdAt: new Date().toISOString(),
          } satisfies VouchData;
        });

        // Fetch vouches given (I vouch for these people)
        const givenAddrs = (givenVouchAddrs as `0x${string}`[]) ?? [];
        const givenPromises = givenAddrs.map(async (borrowerAddr, i) => {
          const [details, profile, ens] = await Promise.all([
            publicClient.readContract({
              address: CONTRACTS.trustCircle,
              abi: TRUST_CIRCLE_ABI,
              functionName: "getVouchDetails",
              args: [userAddress, borrowerAddr],
            }) as Promise<VouchDetailsTuple>,
            publicClient.readContract({
              address: CONTRACTS.trustCircle,
              abi: TRUST_CIRCLE_ABI,
              functionName: "getUserProfile",
              args: [borrowerAddr],
            }).catch(() => null),
            publicClient.readContract({
              address: CONTRACTS.trustCircleENS,
              abi: TRUST_CIRCLE_ENS_ABI,
              functionName: "getProfile",
              args: [borrowerAddr],
            }).catch(() => null),
          ]);

          const [amount, usedAmount, isActive, activatesAt] = details;
          const p = profile as ProfileView | null;
          const e = ens as [string, string, string, boolean] | null;

          return {
            id: `vg-${i}`,
            voucher: {
              address: borrowerAddr,
              ensName: e?.[3] ? e[1] : borrowerAddr.slice(0, 10),
              reputationScore: p ? Number(p.reputationScore) : 0,
              verified: p ? p.isRegistered : false,
            },
            amount: Number(amount) / 1e6,
            usedAmount: Number(usedAmount) / 1e6,
            isActive,
            activatesAt: Number(activatesAt) > 0
              ? new Date(Number(activatesAt) * 1000).toISOString()
              : "",
            createdAt: new Date().toISOString(),
          } satisfies VouchData;
        });

        const [received, given] = await Promise.all([
          Promise.all(receivedPromises),
          Promise.all(givenPromises),
        ]);

        setVouchesReceivedOnChain(received);
        setVouchesGivenOnChain(given);
      } catch (err) {
        console.error("[TrustCircle] Error fetching vouch details:", err);
      } finally {
        setVouchesLoading(false);
      }
    };

    fetchVouchDetails();
  }, [publicClient, userAddress, borrowerVoucherAddrs, givenVouchAddrs]);

  // ── Parse on-chain data ───────────────────────────────
  const userProfile = useMemo<UserProfile | null>(() => {
    if (!isAuthenticated || !address) {
      return null;
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

  const activeLoan = useMemo<LoanData | null>(() => {
    if (!isAuthenticated || !onChainLoan) {
      return null;
    }

    const l = onChainLoan as unknown as ActiveLoanTuple;
    const [loanId, principal, totalDue, amountRepaid, dueDate, gracePeriodEnd, status] = l;

    if (Number(loanId) === 0 && status === 0) return null;

    const statusMap: Record<number, LoanData["status"]> = {
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
      return { limit: 0, voucherCount: 0 };
    }
    const [limit, voucherCount] = onChainLimit as unknown as [bigint, bigint];
    return { limit: Number(limit) / 1e6, voucherCount: Number(voucherCount) };
  }, [isAuthenticated, onChainLimit, vouchesReceivedOnChain, userProfile]);

  // ── Resolved vouches: on-chain only ──
  const vouchesReceived = vouchesReceivedOnChain;
  const vouchesGiven = vouchesGivenOnChain;

  // ── Actions ────────────────────────────────────────────
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
        args: [BigInt(proof.merkle_root), BigInt(proof.nullifier_hash), proofArray],
      }]);
      invalidateOnChainQueries();
    }, { loadingMsg: "Registering with World ID...", successMsg: "Registration successful!", errorMsg: "Registration failed" });
  }, [withFeedback, invalidateOnChainQueries]);

  const vouch = useCallback(async (borrowerAddress: string, amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      await sendTx([
        { address: CONTRACTS.mockUSDC, abi: ERC20_ABI as unknown as readonly unknown[], functionName: "approve", args: [CONTRACTS.trustCircle, amountWei] },
        { address: CONTRACTS.trustCircle, abi: TRUST_CIRCLE_ABI, functionName: "vouchForUser", args: [borrowerAddress, amountWei] },
      ]);
      invalidateOnChainQueries();
    }, {
      loadingMsg: `Vouching $${amount} USDC...`,
      successMsg: VOUCH_ACTIVATION_DELAY_HOURS > 0
        ? `Vouched $${amount} USDC! Activates in ${VOUCH_ACTIVATION_DELAY_HOURS}h.`
        : `Vouched $${amount} USDC! Active immediately (demo mode).`,
      errorMsg: "Vouch failed",
    });
  }, [withFeedback, invalidateOnChainQueries]);

  const borrow = useCallback(async (amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      await sendTx([{ address: CONTRACTS.trustCircle, abi: TRUST_CIRCLE_ABI, functionName: "borrow", args: [amountWei] }]);
      invalidateOnChainQueries();
    }, { loadingMsg: `Borrowing $${amount} USDC...`, successMsg: `Borrowed $${amount} USDC successfully!`, errorMsg: "Borrow failed" });
  }, [withFeedback, invalidateOnChainQueries]);

  const repay = useCallback(async (amount: number) => {
    await withFeedback(async () => {
      const amountWei = parseUnits(amount.toString(), 6);
      await sendTx([
        { address: CONTRACTS.mockUSDC, abi: ERC20_ABI as unknown as readonly unknown[], functionName: "approve", args: [CONTRACTS.trustCircle, amountWei] },
        { address: CONTRACTS.trustCircle, abi: TRUST_CIRCLE_ABI, functionName: "repayLoan", args: [amountWei] },
      ]);
      invalidateOnChainQueries();
    }, { loadingMsg: `Repaying $${amount} USDC...`, successMsg: `Repaid $${amount} USDC!`, errorMsg: "Repayment failed" });
  }, [withFeedback, invalidateOnChainQueries]);

  const revokeVouch = useCallback(async (borrowerAddress: string) => {
    await withFeedback(async () => {
      await sendTx([{ address: CONTRACTS.trustCircle, abi: TRUST_CIRCLE_ABI, functionName: "revokeVouch", args: [borrowerAddress] }]);
      invalidateOnChainQueries();
    }, { loadingMsg: "Revoking vouch...", successMsg: "Vouch revoked!", errorMsg: "Revoke failed" });
  }, [withFeedback, invalidateOnChainQueries]);

  const liquidate = useCallback(async (borrowerAddress: string) => {
    await withFeedback(async () => {
      await sendTx([{ address: CONTRACTS.trustCircle, abi: TRUST_CIRCLE_ABI, functionName: "liquidateDefaultedLoan", args: [borrowerAddress] }]);
      invalidateOnChainQueries();
    }, { loadingMsg: "Liquidating defaulted loan...", successMsg: "Loan liquidated! Bounty earned.", errorMsg: "Liquidation failed" });
  }, [withFeedback, invalidateOnChainQueries]);

  const actions: TrustCircleActions = useMemo(
    () => ({ register, vouch, borrow, repay, revokeVouch, liquidate }),
    [register, vouch, borrow, repay, revokeVouch, liquidate],
  );

  return {
    userProfile,
    activeLoan,
    availableLimit,
    vouchesReceived,
    vouchesGiven,
    actions,
    isLoading: profileLoading || loanLoading || limitLoading || vouchesLoading,
    error: null,
  };
}
