"use client";

import { useState, useEffect } from "react";
import { usePublicClient, useReadContract } from "wagmi";
import { CONTRACTS, TRUST_CIRCLE_ABI } from "@/lib/contracts";
import { useWalletAuth } from "@/contexts/wallet-auth-context";

export interface LoanHistoryItem {
  id: string;
  principal: number;
  totalDue: number;
  amountRepaid: number;
  interestRate: number;
  status: "Repaid" | "Active" | "Defaulted";
  date: string;
  interestPaid: number;
}

/**
 * Reads loan history from on-chain events:
 * - LoanCreated(loanId, borrower, principal, interestRate, dueDate, insuranceContrib)
 * - LoanRepaid(loanId, borrower, amount, fullyRepaid)
 * - LoanDefaulted(loanId, borrower, totalSlashed)
 */
export function useLoanHistory(): {
  loanHistory: LoanHistoryItem[];
  isLoading: boolean;
} {
  const { address, isAuthenticated } = useWalletAuth();
  const publicClient = usePublicClient();
  const userAddress = address as `0x${string}` | undefined;

  const [loanHistory, setLoanHistory] = useState<LoanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Also read active loan for current state
  const { data: onChainLoan } = useReadContract({
    address: CONTRACTS.trustCircle,
    abi: TRUST_CIRCLE_ABI,
    functionName: "getActiveLoan",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && isAuthenticated },
  });

  useEffect(() => {
    if (!publicClient || !userAddress || !isAuthenticated) {
      setLoanHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Fetch LoanCreated events for this borrower
        const createdEvents = await publicClient.getContractEvents({
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          eventName: "LoanCreated",
          args: { borrower: userAddress },
          fromBlock: BigInt(0),
        });

        // Fetch LoanRepaid events
        const repaidEvents = await publicClient.getContractEvents({
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          eventName: "LoanRepaid",
          args: { borrower: userAddress },
          fromBlock: BigInt(0),
        });

        // Fetch LoanDefaulted events
        const defaultedEvents = await publicClient.getContractEvents({
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          eventName: "LoanDefaulted",
          args: { borrower: userAddress },
          fromBlock: BigInt(0),
        });

        // Build repaid/defaulted lookup maps
        const fullyRepaidLoans = new Set<string>();
        for (const e of repaidEvents) {
          const args = e.args as { loanId?: bigint; fullyRepaid?: boolean };
          if (args.fullyRepaid) {
            fullyRepaidLoans.add(String(args.loanId));
          }
        }

        const defaultedLoans = new Set<string>();
        for (const e of defaultedEvents) {
          const args = e.args as { loanId?: bigint };
          defaultedLoans.add(String(args.loanId));
        }

        // Build loan history items
        const items: LoanHistoryItem[] = createdEvents.map((e) => {
          const args = e.args as {
            loanId?: bigint;
            principal?: bigint;
            interestRate?: bigint;
            dueDate?: bigint;
            insuranceContrib?: bigint;
          };

          const loanIdStr = String(args.loanId ?? BigInt(0));
          let status: LoanHistoryItem["status"] = "Active";
          if (defaultedLoans.has(loanIdStr)) status = "Defaulted";
          else if (fullyRepaidLoans.has(loanIdStr)) status = "Repaid";

          const principal = Number(args.principal ?? BigInt(0)) / 1e6;
          const interestBps = Number(args.interestRate ?? BigInt(0));
          const interestPaid = status === "Repaid" ? principal * (interestBps / 10000) : 0;

          return {
            id: `loan-${Number(args.loanId ?? 0).toString().padStart(3, "0")}`,
            principal,
            totalDue: principal + interestPaid,
            amountRepaid: status === "Repaid" ? principal + interestPaid : 0,
            interestRate: interestBps,
            status,
            date: Number(args.dueDate ?? BigInt(0)) > 0
              ? new Date(Number(args.dueDate) * 1000).toISOString().split("T")[0]
              : "",
            interestPaid: Math.round(interestPaid * 100) / 100,
          };
        });

        // If no events found but there's an active loan from contract state
        if (items.length === 0 && onChainLoan) {
          const [loanId, principal, totalDue, amountRepaid, dueDate, , status] =
            onChainLoan as [bigint, bigint, bigint, bigint, bigint, bigint, number];

          if (Number(loanId) > 0 || status > 0) {
            const statusMap: Record<number, LoanHistoryItem["status"]> = {
              0: "Active", 1: "Active", 2: "Repaid", 3: "Defaulted",
            };
            items.push({
              id: `loan-${Number(loanId).toString().padStart(3, "0")}`,
              principal: Number(principal) / 1e6,
              totalDue: Number(totalDue) / 1e6,
              amountRepaid: Number(amountRepaid) / 1e6,
              interestRate: 0,
              status: statusMap[status] ?? "Active",
              date: Number(dueDate) > 0
                ? new Date(Number(dueDate) * 1000).toISOString().split("T")[0]
                : "",
              interestPaid: 0,
            });
          }
        }

        setLoanHistory(items.reverse()); // newest first
      } catch (err) {
        console.error("[LoanHistory] Error fetching events:", err);
        setLoanHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [publicClient, userAddress, isAuthenticated, onChainLoan]);

  return { loanHistory, isLoading };
}
