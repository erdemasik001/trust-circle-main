// Tier definitions mirroring on-chain ReputationEngine.sol

export const TIERS = [
  { id: 0, name: 'Frozen',      minRep: 0,   maxBorrow: 0,       interestBps: 0,    maxDays: 0,   minVouchers: 0 },
  { id: 1, name: 'Newcomer',    minRep: 100, maxBorrow: 100,     interestBps: 1500, maxDays: 14,  minVouchers: 1 },
  { id: 2, name: 'Rising',      minRep: 200, maxBorrow: 500,     interestBps: 1200, maxDays: 21,  minVouchers: 3 },
  { id: 3, name: 'Building',    minRep: 300, maxBorrow: 2_000,   interestBps: 800,  maxDays: 30,  minVouchers: 3 },
  { id: 4, name: 'Trusted',     minRep: 500, maxBorrow: 10_000,  interestBps: 500,  maxDays: 60,  minVouchers: 3 },
  { id: 5, name: 'Established', minRep: 700, maxBorrow: 50_000,  interestBps: 300,  maxDays: 90,  minVouchers: 5 },
  { id: 6, name: 'Leader',      minRep: 900, maxBorrow: 100_000, interestBps: 200,  maxDays: 180, minVouchers: 5 },
] as const;

/** Convert basis points to percentage (1500 bps → 15%) */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

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

// Voucher multiplier — mirrors on-chain ReputationEngine.getVoucherMultiplier()
// Higher rep vouchers amplify their vouch value
const VOUCHER_MULTIPLIERS = [
  { minRep: 0,   maxRep: 199, multiplier: 0.50 },
  { minRep: 200, maxRep: 499, multiplier: 0.75 },
  { minRep: 500, maxRep: 699, multiplier: 1.00 },
  { minRep: 700, maxRep: 899, multiplier: 1.25 },
  { minRep: 900, maxRep: 1000, multiplier: 1.50 },
] as const;

export function getVoucherMultiplier(rep: number): number {
  for (const m of VOUCHER_MULTIPLIERS) {
    if (rep >= m.minRep && rep <= m.maxRep) return m.multiplier;
  }
  return 0.5;
}
