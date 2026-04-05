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
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border-t border-border/50 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                <span className="text-[10px] font-medium">{t[tab.labelKey]}</span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
