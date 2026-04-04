"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { MiniKit } from '@worldcoin/minikit-js';
import { LanguageProvider } from '@/contexts/language-context';
import { worldChainSepolia } from '@/lib/chains';

// Initialize MiniKit (safe to call in browser — no-ops outside World App)
if (typeof window !== 'undefined') {
  MiniKit.install();
}

const wagmiConfig = createConfig({
  chains: [worldChainSepolia],
  transports: {
    [worldChainSepolia.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
