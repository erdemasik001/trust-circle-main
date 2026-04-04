// Trust Circle Mock Data — Next.js Migration
// Aligned with protocol docs: tiers, reputation, insurance, circuit breaker

// ─── Protocol Constants ──────────────────────────────────

export const TIERS = [
  { id: 0, name: 'Frozen',      minRep: 0,   maxBorrow: 0,       interestBps: 0,    maxDuration: 0,   minVouchers: 0, color: '#6B7280' },
  { id: 1, name: 'Newcomer',    minRep: 100, maxBorrow: 100,     interestBps: 1500, maxDuration: 14,  minVouchers: 1, color: '#9CA3AF' },
  { id: 2, name: 'Rising',      minRep: 200, maxBorrow: 500,     interestBps: 1200, maxDuration: 21,  minVouchers: 3, color: '#60A5FA' },
  { id: 3, name: 'Building',    minRep: 300, maxBorrow: 2000,    interestBps: 800,  maxDuration: 30,  minVouchers: 3, color: '#34D399' },
  { id: 4, name: 'Trusted',     minRep: 500, maxBorrow: 10000,   interestBps: 500,  maxDuration: 60,  minVouchers: 3, color: '#A78BFA' },
  { id: 5, name: 'Established', minRep: 700, maxBorrow: 50000,   interestBps: 300,  maxDuration: 90,  minVouchers: 5, color: '#F59E0B' },
  { id: 6, name: 'Leader',      minRep: 900, maxBorrow: 100000,  interestBps: 200,  maxDuration: 180, minVouchers: 5, color: '#EF4444' },
] as const;

export type TierInfo = typeof TIERS[number];

export function getTierForRep(rep: number): TierInfo {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (rep >= TIERS[i].minRep) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(rep: number): TierInfo | null {
  const current = getTierForRep(rep);
  const nextIndex = TIERS.findIndex(t => t.id === current.id) + 1;
  return nextIndex < TIERS.length ? TIERS[nextIndex] : null;
}

export const VOUCHER_MULTIPLIERS = [
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

// ─── Mock User ───────────────────────────────────────────

export const MOCK_USER = {
  address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  ensName: 'fatma.trustcircle.eth',
  reputationScore: 210,
  verified: true,
  memberSince: '2026-03-01',
  lastActivityAt: '2026-04-03',
  defaultCooldownUntil: 0,
  activeVouchCount: 2,
  loansRepaid: 3,
  loansDefaulted: 0,
  totalBorrowed: 450,
  totalVouched: 300,
};

// ─── Mock Vouches (people who vouch for MOCK_USER) ───────

export interface MockVouch {
  id: string;
  voucher: { address: string; ensName: string; reputationScore: number; verified: boolean };
  amount: number;
  usedAmount: number;
  isActive: boolean;
  activatesAt: string; // ISO date
  createdAt: string;
}

export const MOCK_VOUCHES_RECEIVED: MockVouch[] = [
  {
    id: 'v1',
    voucher: { address: '0xMehmet1234', ensName: 'mehmet.trustcircle.eth', reputationScore: 350, verified: true },
    amount: 200,
    usedAmount: 100,
    isActive: true,
    activatesAt: '2026-03-05T12:00:00Z',
    createdAt: '2026-03-03T12:00:00Z',
  },
  {
    id: 'v2',
    voucher: { address: '0xAyse5678', ensName: 'ayse.trustcircle.eth', reputationScore: 420, verified: true },
    amount: 150,
    usedAmount: 50,
    isActive: true,
    activatesAt: '2026-03-10T12:00:00Z',
    createdAt: '2026-03-08T12:00:00Z',
  },
  {
    id: 'v3',
    voucher: { address: '0xAli9012', ensName: 'ali.trustcircle.eth', reputationScore: 180, verified: true },
    amount: 100,
    usedAmount: 0,
    isActive: false,
    activatesAt: '2026-04-06T12:00:00Z',
    createdAt: '2026-04-04T12:00:00Z',
  },
];

// ─── Mock Active Loan ────────────────────────────────────

export interface MockLoan {
  id: string;
  borrower: string;
  principal: number;
  interestRate: number; // bps
  totalDue: number;
  amountRepaid: number;
  borrowedAt: string;
  dueDate: string;
  gracePeriodEnd: string;
  status: 'Active' | 'Grace' | 'Repaid' | 'Defaulted';
  insuranceContribution: number;
  vouchers: string[];
  voucherAmounts: number[];
}

export const MOCK_ACTIVE_LOAN: MockLoan = {
  id: 'loan-004',
  borrower: MOCK_USER.address,
  principal: 150,
  interestRate: 1200, // 12% (Rising tier)
  totalDue: 155.25, // principal + interest for ~21 days
  amountRepaid: 50,
  borrowedAt: '2026-03-20T10:00:00Z',
  dueDate: '2026-04-10T10:00:00Z',
  gracePeriodEnd: '2026-04-17T10:00:00Z',
  status: 'Active',
  insuranceContribution: 1.5,
  vouchers: ['mehmet.trustcircle.eth', 'ayse.trustcircle.eth'],
  voucherAmounts: [100, 50],
};

// ─── Mock System Health ──────────────────────────────────

export type SystemHealthStatus = 'GREEN' | 'YELLOW' | 'RED' | 'RECOVERY';

export const MOCK_SYSTEM_HEALTH = {
  status: 'GREEN' as SystemHealthStatus,
  activeLoansCount: 45,
  defaultsLast7Days: 2,
  defaultRate: 4.4,
  insurancePoolBalance: 5230,
  totalInsuranceContributions: 8100,
  totalInsurancePayouts: 2870,
  coverageRate: 30, // percent
};

// ─── Mock Recent Activity ────────────────────────────────

export interface ActivityItem {
  id: string;
  type: 'repayment' | 'vouch_received' | 'vouch_given' | 'borrow' | 'rep_change';
  description: string;
  timestamp: string;
  amount?: number;
  repChange?: number;
}

export const MOCK_RECENT_ACTIVITY: ActivityItem[] = [
  { id: 'a1', type: 'repayment', description: 'Repaid $50 on loan #004', timestamp: '2h ago', amount: 50 },
  { id: 'a2', type: 'vouch_received', description: 'ali.trustcircle.eth vouched $100 (pending)', timestamp: '5h ago', amount: 100 },
  { id: 'a3', type: 'rep_change', description: 'Reputation increased to 210', timestamp: '1d ago', repChange: 10 },
  { id: 'a4', type: 'borrow', description: 'Borrowed $150 at 12% (Rising tier)', timestamp: '15d ago', amount: 150 },
  { id: 'a5', type: 'vouch_given', description: 'Vouched $50 for kerem.trustcircle.eth', timestamp: '20d ago', amount: 50 },
];

// ─── Mock Searchable Users (for vouch flow) ──────────────

export const MOCK_SEARCHABLE_USERS = [
  { address: '0xKerem3456', ensName: 'kerem.trustcircle.eth', reputationScore: 150, verified: true, loansRepaid: 1, loansDefaulted: 0 },
  { address: '0xZeynep7890', ensName: 'zeynep.trustcircle.eth', reputationScore: 280, verified: true, loansRepaid: 4, loansDefaulted: 0 },
  { address: '0xEmre2345', ensName: 'emre.trustcircle.eth', reputationScore: 90, verified: true, loansRepaid: 0, loansDefaulted: 1 },
  { address: '0xSelin6789', ensName: 'selin.trustcircle.eth', reputationScore: 510, verified: true, loansRepaid: 12, loansDefaulted: 0 },
];
