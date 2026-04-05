"use client";

import { Wallet, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWalletAuth } from "@/contexts/wallet-auth-context";

export function WalletButton() {
  const { address, isAuthenticated, isLoading, signIn, signOut } = useWalletAuth();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5 text-xs h-8">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </Button>
    );
  }

  if (isAuthenticated && address) {
    return (
      <button
        onClick={signOut}
        className="flex items-center gap-1.5 rounded-full border bg-green-500/10 px-2.5 py-1 text-[10px] font-medium text-green-600 transition-colors hover:bg-red-500/10 hover:text-red-500 group"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-green-500 group-hover:bg-red-500" />
        <span className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <LogOut className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs h-8"
      onClick={signIn}
    >
      <Wallet className="h-3.5 w-3.5" />
      Sign In
    </Button>
  );
}
