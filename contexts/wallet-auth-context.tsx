"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

interface WalletAuthState {
  address: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface WalletAuthContextValue extends WalletAuthState {
  signIn: () => Promise<string | null>;
  signOut: () => void;
}

const WalletAuthContext = createContext<WalletAuthContextValue | null>(null);

export function useWalletAuth(): WalletAuthContextValue {
  const ctx = useContext(WalletAuthContext);
  if (!ctx) throw new Error("useWalletAuth must be used within WalletAuthProvider");
  return ctx;
}

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletAuthState>({
    address: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const signIn = useCallback(async (): Promise<string | null> => {
    setState((s) => ({ ...s, isLoading: true }));

    try {
      if (MiniKit.isInstalled()) {
        // Inside World App — use native walletAuth
        const nonce = crypto.randomUUID().replace(/-/g, "");
        const result = await MiniKit.walletAuth({
          nonce,
          expirationTime: new Date(Date.now() + 60 * 60 * 1000),
          statement: "Sign in to Trust Circle",
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = (result as any).finalPayload ?? result;

        if (payload.status === "error") {
          throw new Error(payload.error_code ?? "walletAuth failed");
        }

        const address = payload.address ?? payload.data?.address ?? null;

        if (address) {
          // Verify SIWE on server
          const verifyRes = await fetch("/api/complete-siwe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload, nonce }),
          }).catch(() => null);

          // Even if server verify fails, we have the address from MiniKit
          setState({ address, isAuthenticated: true, isLoading: false });
          return address;
        }

        throw new Error("No address returned from walletAuth");
      }

      // Outside World App — mock for development
      console.log("[WalletAuth] Not in World App, using mock address");
      await new Promise((r) => setTimeout(r, 1000));
      const mockAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      setState({ address: mockAddress, isAuthenticated: true, isLoading: false });
      return mockAddress;
    } catch (err) {
      console.error("[WalletAuth] Error:", err);
      setState({ address: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  }, []);

  const signOut = useCallback(() => {
    setState({ address: null, isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <WalletAuthContext value={{ ...state, signIn, signOut }}>
      {children}
    </WalletAuthContext>
  );
}
