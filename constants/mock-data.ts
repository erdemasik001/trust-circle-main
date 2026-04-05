// Trust Circle Mock Data — Next.js Migration
// Aligned with protocol docs: tiers, reputation, insurance, circuit breaker

// Tier definitions are in lib/tiers.ts (single source of truth)

// Voucher multiplier moved to lib/tiers.ts (single source of truth)

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

// ─── Mock Vouches Given (vouches MOCK_USER gave to others) ──

export const MOCK_VOUCHES_GIVEN: MockVouch[] = [
  {
    id: 'vg1',
    voucher: { address: MOCK_USER.address, ensName: MOCK_USER.ensName, reputationScore: MOCK_USER.reputationScore, verified: true },
    amount: 50,
    usedAmount: 30,
    isActive: true,
    activatesAt: '2026-03-15T12:00:00Z',
    createdAt: '2026-03-13T12:00:00Z',
  },
];

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
