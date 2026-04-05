"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACTS, TRUST_CIRCLE_ABI, TRUST_CIRCLE_ENS_ABI } from "@/lib/contracts";
import { MOCK_SEARCHABLE_USERS } from "@/constants/mock-data";

export interface RegisteredUser {
  address: string;
  ensName: string;
  reputationScore: number;
  verified: boolean;
  loansRepaid: number;
  loansDefaulted: number;
}

/**
 * Reads UserRegistered events to build a searchable user directory.
 * For each registered address, fetches profile + ENS data.
 * Falls back to MOCK_SEARCHABLE_USERS if no on-chain users found.
 */
export function useRegisteredUsers() {
  const publicClient = usePublicClient();
  const [users, setUsers] = useState<RegisteredUser[]>(MOCK_SEARCHABLE_USERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!publicClient) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Get all UserRegistered events
        const events = await publicClient.getContractEvents({
          address: CONTRACTS.trustCircle,
          abi: TRUST_CIRCLE_ABI,
          eventName: "UserRegistered",
          fromBlock: BigInt(0),
        });

        if (events.length === 0) {
          // No on-chain users, keep mock
          setIsLoading(false);
          return;
        }

        // Extract unique addresses
        const addresses = [...new Set(
          events.map((e) => (e.args as { user?: `0x${string}` }).user).filter(Boolean),
        )] as `0x${string}`[];

        // Fetch profile + ENS for each (limit to 20 for performance)
        const limitedAddrs = addresses.slice(0, 20);
        const userPromises = limitedAddrs.map(async (addr): Promise<RegisteredUser> => {
          const [profile, ens] = await Promise.all([
            publicClient.readContract({
              address: CONTRACTS.trustCircle,
              abi: TRUST_CIRCLE_ABI,
              functionName: "getUserProfile",
              args: [addr],
            }).catch(() => null),
            publicClient.readContract({
              address: CONTRACTS.trustCircleENS,
              abi: TRUST_CIRCLE_ENS_ABI,
              functionName: "getProfile",
              args: [addr],
            }).catch(() => null),
          ]);

          const p = profile as {
            isRegistered: boolean;
            reputationScore: bigint;
            frozen: boolean;
          } | null;

          const e = ens as [string, string, string, boolean] | null;

          return {
            address: addr,
            ensName: e?.[3] ? e[1] : `${addr.slice(0, 6)}...${addr.slice(-4)}`,
            reputationScore: p ? Number(p.reputationScore) : 0,
            verified: p ? p.isRegistered : false,
            loansRepaid: 0,
            loansDefaulted: 0,
          };
        });

        const fetchedUsers = await Promise.all(userPromises);
        setUsers(fetchedUsers.length > 0 ? fetchedUsers : MOCK_SEARCHABLE_USERS);
      } catch (err) {
        console.error("[RegisteredUsers] Error:", err);
        // Keep mock on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [publicClient]);

  return { users, isLoading };
}
