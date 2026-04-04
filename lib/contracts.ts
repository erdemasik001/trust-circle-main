// ============================================================
// TrustCircle Contract Addresses & ABIs
// ============================================================

// Contract addresses — placeholder values, replace after deployment
export const CONTRACTS = {
  trustCircle: '0x...' as `0x${string}`,
  reputationEngine: '0x...' as `0x${string}`,
  insurancePool: '0x...' as `0x${string}`,
  circuitBreaker: '0x...' as `0x${string}`,
  trustCircleENS: '0x...' as `0x${string}`,
  mockUSDC: '0x...' as `0x${string}`,
  mockWorldID: '0x...' as `0x${string}`,
} as const;

// ============================================================
// TrustCircle ABI
// ============================================================

export const TRUST_CIRCLE_ABI = [
  // --- Functions ---
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
  {
    type: 'function',
    name: 'getUserProfile',
    inputs: [
      { name: 'user', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'userAddress', type: 'address', internalType: 'address' },
      { name: 'ensName', type: 'string', internalType: 'string' },
      { name: 'reputationScore', type: 'uint256', internalType: 'uint256' },
      { name: 'effectiveRep', type: 'uint256', internalType: 'uint256' },
      { name: 'tierIndex', type: 'uint256', internalType: 'uint256' },
      { name: 'tierName', type: 'string', internalType: 'string' },
      { name: 'maxBorrow', type: 'uint256', internalType: 'uint256' },
      { name: 'interestBps', type: 'uint256', internalType: 'uint256' },
      { name: 'maxDuration', type: 'uint256', internalType: 'uint256' },
      { name: 'minVouchers', type: 'uint256', internalType: 'uint256' },
      { name: 'totalVouchesReceived', type: 'uint256', internalType: 'uint256' },
      { name: 'totalBorrowed', type: 'uint256', internalType: 'uint256' },
      { name: 'registeredAt', type: 'uint256', internalType: 'uint256' },
      { name: 'lastActivityAt', type: 'uint256', internalType: 'uint256' },
      { name: 'defaultCooldownUntil', type: 'uint256', internalType: 'uint256' },
      { name: 'activeVouchCount', type: 'uint256', internalType: 'uint256' },
      { name: 'isFrozen', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getActiveLoan',
    inputs: [
      { name: 'borrower', type: 'address', internalType: 'address' },
    ],
    outputs: [
      { name: 'loanId', type: 'uint256', internalType: 'uint256' },
      { name: 'principal', type: 'uint256', internalType: 'uint256' },
      { name: 'interestRate', type: 'uint256', internalType: 'uint256' },
      { name: 'totalDue', type: 'uint256', internalType: 'uint256' },
      { name: 'amountRepaid', type: 'uint256', internalType: 'uint256' },
      { name: 'borrowedAt', type: 'uint256', internalType: 'uint256' },
      { name: 'dueDate', type: 'uint256', internalType: 'uint256' },
      { name: 'gracePeriodEnd', type: 'uint256', internalType: 'uint256' },
      { name: 'status', type: 'uint8', internalType: 'uint8' },
      { name: 'vouchers', type: 'address[]', internalType: 'address[]' },
      { name: 'voucherAmounts', type: 'uint256[]', internalType: 'uint256[]' },
      { name: 'insuranceContribution', type: 'uint256', internalType: 'uint256' },
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

  // --- Events ---
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
    name: 'LoanDefaulted',
    inputs: [
      { name: 'loanId', type: 'uint256', indexed: true, internalType: 'uint256' },
      { name: 'borrower', type: 'address', indexed: true, internalType: 'address' },
      { name: 'totalSlashed', type: 'uint256', indexed: false, internalType: 'uint256' },
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
] as const;

// ============================================================
// ReputationEngine ABI
// ============================================================

export const REPUTATION_ENGINE_ABI = [
  {
    type: 'function',
    name: 'getTier',
    inputs: [
      { name: 'rep', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [
      { name: 'minRep', type: 'uint256', internalType: 'uint256' },
      { name: 'maxBorrow', type: 'uint256', internalType: 'uint256' },
      { name: 'interestBps', type: 'uint256', internalType: 'uint256' },
      { name: 'maxDuration', type: 'uint256', internalType: 'uint256' },
      { name: 'minVouchers', type: 'uint256', internalType: 'uint256' },
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
    stateMutability: 'view',
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
        internalType: 'struct ReputationEngine.Tier[7]',
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
// InsurancePool ABI
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
] as const;

// ============================================================
// CircuitBreaker ABI
// ============================================================

export const CIRCUIT_BREAKER_ABI = [
  {
    type: 'function',
    name: 'getHealth',
    inputs: [],
    outputs: [
      { name: '', type: 'uint8', internalType: 'uint8' },
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
      { name: '', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getStats',
    inputs: [],
    outputs: [
      { name: 'activeLoans', type: 'uint256', internalType: 'uint256' },
      { name: 'totalLoans', type: 'uint256', internalType: 'uint256' },
      { name: 'totalDefaults', type: 'uint256', internalType: 'uint256' },
      { name: 'recentDefaults', type: 'uint256', internalType: 'uint256' },
    ],
    stateMutability: 'view',
  },
] as const;

// ============================================================
// TrustCircleENS ABI
// ============================================================

export const TRUST_CIRCLE_ENS_ABI = [
  // --- Functions ---
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
    name: 'setTextRecord',
    inputs: [
      { name: 'key', type: 'string', internalType: 'string' },
      { name: 'value', type: 'string', internalType: 'string' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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

  // --- Events ---
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
] as const;

// ============================================================
// ERC20 ABI (minimal: approve, balanceOf, allowance, decimals)
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
] as const;
