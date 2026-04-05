// ============================================================
// TrustCircle Contract Addresses & ABIs
// Aligned with deployed Solidity contracts (2026-04-05)
// ============================================================

// Contract addresses — World Chain Sepolia (Chain ID: 4801)
export const CONTRACTS = {
  trustCircle: '0xB92BABEfb4718697dBAB4262119B643237302fD9' as `0x${string}`,
  reputationEngine: '0xE98Ebc7ef9B7884228DF8e55883f8A5BcE2F74ff' as `0x${string}`,
  insurancePool: '0xCb0B77045fDc36c3C10a4c5B7bEa8C55B3aE8960' as `0x${string}`,
  circuitBreaker: '0xA53acC4059A808fCb83eB242a755c6D32cdbaE63' as `0x${string}`,
  trustCircleENS: '0x451e7B2E5b06997F72B48ed25A21009307269b01' as `0x${string}`,
  mockUSDC: '0x461Ed0Ae7525b4f0dAc1697e916e41F96123A307' as `0x${string}`,
  mockWorldID: '0x54e96Ad2F33aB7E01fFCEB6e6CE97DEE3c8D222D' as `0x${string}`,
} as const;

// Contract addresses — Arc Testnet (Chain ID: 5042002)
export const ARC_CONTRACTS = {
  trustCircle: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  reputationEngine: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  insurancePool: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  circuitBreaker: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  trustCircleENS: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  mockUSDC: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  mockWorldID: '0x0000000000000000000000000000000000000000' as `0x${string}`,
} as const;

export function getContracts(chainId: number) {
  if (chainId === 5042002) return ARC_CONTRACTS;
  return CONTRACTS;
}

// ============================================================
// TrustCircle ABI (matches TrustCircle.sol)
// ============================================================

export const TRUST_CIRCLE_ABI = [
  // ─── Write Functions ─────────────────────────────────────
  {
    type: 'function',
    name: 'registerWithWorldID',
    inputs: [
      { name: 'root', type: 'uint256', internalType: 'uint256' },
      { name: 'nullifierHash', type: 'uint256', internalType: 'uint256' },
      { name: 'proof', type: 'uint256[8]', internalType: 'uint256[8]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'vouchForUser',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokeVouch',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrow',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'repayLoan',
    inputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'liquidateDefaultedLoan',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── Admin Functions ─────────────────────────────────────
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      { name: 'newOwner', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawProtocolFees',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── View Functions ──────────────────────────────────────
  // getUserProfile returns ProfileView struct (9 fields)
  {
    type: 'function',
    name: 'getUserProfile',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
    ],
    outputs: [
      {
        name: 'p',
        type: 'tuple',
        internalType: 'struct TrustCircle.ProfileView',
        components: [
          { name: 'isRegistered', type: 'bool', internalType: 'bool' },
          { name: 'reputationScore', type: 'uint256', internalType: 'uint256' },
          { name: 'effectiveRep', type: 'uint256', internalType: 'uint256' },
          { name: 'totalVouchesReceived', type: 'uint256', internalType: 'uint256' },
          { name: 'totalBorrowed', type: 'uint256', internalType: 'uint256' },
          { name: 'registeredAt', type: 'uint256', internalType: 'uint256' },
          { name: 'activeLoan', type: 'uint256', internalType: 'uint256' },
          { name: 'activeVouchCount', type: 'uint256', internalType: 'uint256' },
          { name: 'frozen', type: 'bool', internalType: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  // getActiveLoan returns 7 fields (NOT a struct, flat tuple)
  {
    type: 'function',
    name: 'getActiveLoan',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'loanId', type: 'uint256', internalType: 'uint256' },
      { name: 'principal', type: 'uint256', internalType: 'uint256' },
      { name: 'totalDue', type: 'uint256', internalType: 'uint256' },
      { name: 'amountRepaid', type: 'uint256', internalType: 'uint256' },
      { name: 'dueDate', type: 'uint256', internalType: 'uint256' },
      { name: 'gracePeriodEnd', type: 'uint256', internalType: 'uint256' },
      { name: 'status', type: 'uint8', internalType: 'enum TrustCircle.LoanStatus' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAvailableLimit',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'limit', type: 'uint256', internalType: 'uint256' },
      { name: 'voucherCount', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVouchDetails',
    inputs: [
      { name: 'voucher', type: 'address', internalType: 'address' },
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
      { name: 'usedAmount', type: 'uint256', internalType: 'uint256' },
      { name: 'isActive', type: 'bool', internalType: 'bool' },
      { name: 'activatesAt', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLoanVouchers',
    inputs: [
      { name: 'loanId', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'address[]', internalType: 'address[]' },
      { name: '', type: 'uint256[]', internalType: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getBorrowerVouchers',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'address[]', internalType: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVouchesGivenTo',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'address[]', internalType: 'address[]' },
    ],
    stateMutability: 'view',
  },

  // ─── Public State ────────────────────────────────────────
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool', internalType: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'loanCounter',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolFeeAccumulated',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },

  // ─── Events ──────────────────────────────────────────────
  {
    type: 'event',
    name: 'UserRegistered',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'nullifierHash', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'VouchCreated',
    inputs: [
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'activatesAt', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'VouchUpdated',
    inputs: [
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'oldAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'newAmount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'VouchRevoked',
    inputs: [
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'LoanCreated',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'principal', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'interestRate', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'dueDate', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'insuranceContrib', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'LoanRepaid',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'fullyRepaid', type: 'bool', indexed: false, internalType: 'bool' },
    ],
  },
  {
    type: 'event',
    name: 'LateRepayment',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'lateFee', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'YieldDistributed',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'principal', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'yield', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'LoanDefaulted',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'totalSlashed', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'VoucherSlashed',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'loss', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'insuranceCovered', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'LiquidationBounty',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'liquidator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'bounty', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ReputationUpdated',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'oldScore', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'newScore', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'AccountFrozen',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'cooldownUntil', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'ProtocolFeeCollected',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'fee', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
] as const;

// ============================================================
// ReputationEngine ABI (matches ReputationEngine.sol)
// ============================================================

export const REPUTATION_ENGINE_ABI = [
  {
    type: 'function',
    name: 'getTier',
    inputs: [
      { name: 'rep', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IReputationEngine.Tier',
        components: [
          { name: 'minRep', type: 'uint256', internalType: 'uint256' },
          { name: 'maxBorrow', type: 'uint256', internalType: 'uint256' },
          { name: 'interestBps', type: 'uint256', internalType: 'uint256' },
          { name: 'maxDuration', type: 'uint256', internalType: 'uint256' },
          { name: 'minVouchers', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTierIndex',
    inputs: [
      { name: 'rep', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEffectiveRep',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'rawRep', type: 'uint256', internalType: 'uint256' },
      { name: 'lastActivityAt', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getVoucherMultiplier',
    inputs: [
      { name: 'voucherRep', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'isAccountFrozen',
    inputs: [
      { name: 'rep', type: 'uint256', internalType: 'uint256' },
      { name: 'cooldownUntil', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAllTiers',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'tuple[7]',
        internalType: 'struct IReputationEngine.Tier[7]',
        components: [
          { name: 'minRep', type: 'uint256', internalType: 'uint256' },
          { name: 'maxBorrow', type: 'uint256', internalType: 'uint256' },
          { name: 'interestBps', type: 'uint256', internalType: 'uint256' },
          { name: 'maxDuration', type: 'uint256', internalType: 'uint256' },
          { name: 'minVouchers', type: 'uint256', internalType: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
] as const;

// ============================================================
// InsurancePool ABI (matches InsurancePool.sol)
// ============================================================

export const INSURANCE_POOL_ABI = [
  {
    type: 'function',
    name: 'getBalance',
    inputs: [],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStats',
    inputs: [],
    outputs: [
      { name: 'balance', type: 'uint256', internalType: 'uint256' },
      { name: 'contributions', type: 'uint256', internalType: 'uint256' },
      { name: 'coveragePaid', type: 'uint256', internalType: 'uint256' },
      { name: 'bountiesPaid', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'Contributed',
    inputs: [
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'newBalance', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'CoveragePaid',
    inputs: [
      { name: 'voucher', type: 'address', indexed: true, internalType: 'address' },
      { name: 'loss', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'covered', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'BountyPaid',
    inputs: [
      { name: 'liquidator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'bounty', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
] as const;

// ============================================================
// CircuitBreaker ABI (matches CircuitBreaker.sol)
// ============================================================

export const CIRCUIT_BREAKER_ABI = [
  {
    type: 'function',
    name: 'getHealth',
    inputs: [],
    outputs: [
      { name: '', type: 'uint8', internalType: 'enum ICircuitBreaker.SystemHealth' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'canCreateLoan',
    inputs: [],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEffectiveMaxBorrow',
    inputs: [
      { name: 'tierMax', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getEffectiveRate',
    inputs: [
      { name: 'tierRate', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getDefaultRate',
    inputs: [],
    outputs: [
      { name: 'rateBps', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStats',
    inputs: [],
    outputs: [
      { name: '_activeLoans', type: 'uint256', internalType: 'uint256' },
      { name: '_totalLoans', type: 'uint256', internalType: 'uint256' },
      { name: '_totalDefaults', type: 'uint256', internalType: 'uint256' },
      { name: '_recentDefaults', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // Events
  {
    type: 'event',
    name: 'HealthChanged',
    inputs: [
      { name: 'oldHealth', type: 'uint8', indexed: false, internalType: 'enum ICircuitBreaker.SystemHealth' },
      { name: 'newHealth', type: 'uint8', indexed: false, internalType: 'enum ICircuitBreaker.SystemHealth' },
      { name: 'defaultRate', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'LoanRecorded',
    inputs: [
      { name: 'activeLoans', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'DefaultRecorded',
    inputs: [
      { name: 'defaultsInWindow', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'activeLoans', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
] as const;

// ============================================================
// TrustCircleENS ABI (matches TrustCircleENS.sol)
// ============================================================

export const TRUST_CIRCLE_ENS_ABI = [
  // ─── Write Functions ─────────────────────────────────────
  {
    type: 'function',
    name: 'claimSubname',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferSubname',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'linkMainnetENS',
    inputs: [
      { name: 'ensName', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTextRecord',
    inputs: [
      { name: 'key', type: 'string', internalType: 'string' },
      { name: 'value', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ─── View Functions ──────────────────────────────────────
  {
    type: 'function',
    name: 'resolve',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
    ],
    outputs: [
      { name: '', type: 'address', internalType: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'reverseResolve',
    inputs: [
      { name: 'addr', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isSubnameAvailable',
    inputs: [
      { name: 'name', type: 'string', internalType: 'string' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProfile',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'subname', type: 'string', internalType: 'string' },
      { name: 'fullName', type: 'string', internalType: 'string' },
      { name: 'mainnetENS', type: 'string', internalType: 'string' },
      { name: 'hasSubname', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTextRecord',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
      { name: 'key', type: 'string', internalType: 'string' },
    ],
    outputs: [
      { name: '', type: 'string', internalType: 'string' },
    ],
    stateMutability: 'view',
  },

  // ─── Events ──────────────────────────────────────────────
  {
    type: 'event',
    name: 'SubnameClaimed',
    inputs: [
      { name: 'owner', type: 'address', indexed: true, internalType: 'address' },
      { name: 'subname', type: 'string', indexed: false, internalType: 'string' },
      { name: 'fullName', type: 'string', indexed: false, internalType: 'string' },
      { name: 'timestamp', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'SubnameTransferred',
    inputs: [
      { name: 'subname', type: 'string', indexed: false, internalType: 'string' },
      { name: 'from', type: 'address', indexed: true, internalType: 'address' },
      { name: 'to', type: 'address', indexed: true, internalType: 'address' },
    ],
  },
  {
    type: 'event',
    name: 'MainnetENSLinked',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'ensName', type: 'string', indexed: false, internalType: 'string' },
    ],
  },
  {
    type: 'event',
    name: 'TextRecordSet',
    inputs: [
      { name: 'user', type: 'address', indexed: true, internalType: 'address' },
      { name: 'key', type: 'string', indexed: false, internalType: 'string' },
      { name: 'value', type: 'string', indexed: false, internalType: 'string' },
    ],
  },
] as const;

// ============================================================
// ERC20 ABI (minimal: approve, balanceOf, allowance, decimals, mint)
// ============================================================

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: '', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [
      { name: 'account', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address', internalType: 'address' },
      { name: 'spender', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [
      { name: '', type: 'uint8', internalType: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'mint',
    inputs: [
      { name: 'to', type: 'address', internalType: 'address' },
      { name: 'amount', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;
