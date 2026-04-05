"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, HandCoins, Shield, User } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', icon: Home, labelKey: 'tabHome' as const },
  { href: '/borrow', icon: HandCoins, labelKey: 'tabBorrow' as const },
  { href: '/vouch', icon: Shield, labelKey: 'tabVouch' as const },
  { href: '/profile', icon: User, labelKey: 'tabProfile' as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-3 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around rounded-2xl border border-white/20 bg-white/80 px-2 py-2 shadow-lg shadow-black/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80 mb-2">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 gradient-brand rounded-xl opacity-90" />
                )}
                <Icon className={cn("relative h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="relative text-[10px] font-semibold">{t[tab.labelKey]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
