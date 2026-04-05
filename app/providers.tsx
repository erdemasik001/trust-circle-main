"use client";

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { MiniKitProvider } from '@worldcoin/minikit-js/provider';
import { LanguageProvider } from '@/contexts/language-context';
import { ToastProvider } from '@/components/ui/toast';
import { WalletAuthProvider } from '@/contexts/wallet-auth-context';
import { worldChainSepolia, arcTestnet } from '@/lib/chains';

// wagmi config — only for READ operations (useReadContract).
// No connectors needed — writes go through MiniKit.sendTransaction().
const wagmiConfig = createConfig({
  chains: [worldChainSepolia, arcTestnet],
  transports: {
    [worldChainSepolia.id]: http(),
    [arcTestnet.id]: http(),
  },
  ssr: true,
});

const queryClient = new QueryClient();

const appId = process.env.NEXT_PUBLIC_WORLD_ID_APP_ID ?? 'app_staging_trust_circle';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider props={{ appId }}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <LanguageProvider>
              <WalletAuthProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </WalletAuthProvider>
            </LanguageProvider>
          </ThemeProvider>
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
