export interface User {
  address: string;
  ensName?: string;
  isVerified: boolean;
  nullifierHash?: string;
  reputationScore: number;
  lastActivityAt?: string;
  defaultCooldownUntil?: number;
  activeVouchCount?: number;
}

export interface Vouch {
  id: string;
  voucher: User;
  borrower: User;
  amount: number;
  usedAmount: number;
  isActive: boolean;
  activatesAt: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  borrower: string;
  principal: number;
  interestRate: number;
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

export type SystemHealth = 'GREEN' | 'YELLOW' | 'RED' | 'RECOVERY';
export type SystemHealthStatus = SystemHealth;

export interface ActivityItem {
  id: string;
  type: 'repayment' | 'vouch_received' | 'vouch_given' | 'borrow' | 'rep_change';
  description: string;
  timestamp: string;
  amount?: number;
  repChange?: number;
}

export interface TrustSummary {
  user: User;
  vouchesReceived: Vouch[];
  vouchesGiven: Vouch[];
  trustScore: number;
  outstandingDebt: number;
  activeLoan?: Loan;
}
