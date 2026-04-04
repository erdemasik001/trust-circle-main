// Tier definitions mirroring on-chain ReputationEngine.sol

export const TIERS = [
  { id: 0, name: 'Frozen',      minRep: 0,   maxBorrow: 0,       interestRate: 0,    maxDays: 0,   minVouchers: 0 },
  { id: 1, name: 'Newcomer',    minRep: 100, maxBorrow: 100,     interestRate: 15,   maxDays: 14,  minVouchers: 1 },
  { id: 2, name: 'Rising',      minRep: 200, maxBorrow: 500,     interestRate: 12,   maxDays: 21,  minVouchers: 3 },
  { id: 3, name: 'Building',    minRep: 300, maxBorrow: 2_000,   interestRate: 8,    maxDays: 30,  minVouchers: 3 },
  { id: 4, name: 'Trusted',     minRep: 500, maxBorrow: 10_000,  interestRate: 5,    maxDays: 60,  minVouchers: 3 },
  { id: 5, name: 'Established', minRep: 700, maxBorrow: 50_000,  interestRate: 3,    maxDays: 90,  minVouchers: 5 },
  { id: 6, name: 'Leader',      minRep: 900, maxBorrow: 100_000, interestRate: 2,    maxDays: 180, minVouchers: 5 },
] as const;

export type Tier = typeof TIERS[number];

export function getTierForRep(rep: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (rep >= TIERS[i].minRep) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(rep: number): Tier | null {
  const current = getTierForRep(rep);
  const idx = TIERS.findIndex(t => t.id === current.id) + 1;
  return idx < TIERS.length ? TIERS[idx] : null;
}

export function getTierProgress(rep: number): number {
  const current = getTierForRep(rep);
  const next = getNextTier(rep);
  if (!next) return 100;
  const range = next.minRep - current.minRep;
  const progress = rep - current.minRep;
  return Math.round((progress / range) * 100);
}

export const TIER_COLORS: Record<string, string> = {
  Frozen: '#6B7280',
  Newcomer: '#9CA3AF',
  Rising: '#60A5FA',
  Building: '#34D399',
  Trusted: '#A78BFA',
  Established: '#F59E0B',
  Leader: '#EF4444',
};
