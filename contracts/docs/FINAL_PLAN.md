# Trust Circle — Final Hackathon Plan

> **Event:** ETHGlobal Cannes 2026
> **Rule:** Max 3 Partner Prizes per project (+ ETHGlobal Finalist separately)
> **Status:** Contracts V1 deployed but need full rewrite for Nash-balanced V2

---

## 1. Track Selection: The 3 Partners

### Evaluation Matrix (All 12 Sponsors)

```
SPONSOR          PRIZE    FIT   EFFORT   TOTAL   PICK?
─────────────────────────────────────────────────────────
World            $20K     10/10  Low      ★★★★★  ✅ PICK 1
  World ID 4.0   $8K      Perfect — protocol BREAKS without it
  MiniKit 2.0    $4K      Perfect — Mini App on World Chain
  AgentKit       $8K      Stretch — would need liquidation agent

ENS              $10K     9/10   Low      ★★★★★  ✅ PICK 2
  Creative Use   $5K      Perfect — ENS subnames as credit identity
  AI Agents      $5K      Stretch — agent fleet with ENS names

Arc (Circle)     $15K     8/10   Medium   ★★★★   ✅ PICK 3
  Stablecoin     $3K      Perfect — USDC escrow + yield + slash
  Chain Abstract $3K      Medium — multi-chain USDC
  Agentic Nano   $6K      Stretch — AI agent nanopayments
  Prediction Mkt $3K      No fit

Chainlink        $7K      5/10   Low      ★★★    ❌ (save slot)
  CRE Workflow   $4K      Medium — could use for off-chain data
  Price Feeds    $1K      Easy but small prize
  Privacy        $2K      No fit

Unlink           $5K      4/10   Medium   ★★     ❌
  Private DeFi   $1K      Could hide vouch amounts — creative but small

Dynamic          $5K      3/10   Low      ★★     ❌
  JS SDK         $1.6K    Just swap wallet SDK — too small to waste a slot

WalletConnect    $5K      3/10   Medium   ★★     ❌
  Pay            $4K      Repayment flow — decent but weaker narrative

0G               $15K     2/10   High     ★      ❌ Different chain
Hedera           $15K     1/10   High     ★      ❌ Different chain
Uniswap          $10K     1/10   High     ★      ❌ No DEX needed
Flare            $10K     0/10   High     ★      ❌ No fit
Ledger           $10K     2/10   High     ★      ❌ Niche
```

### Final 3 Partner Picks

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PARTNER 1: WORLD                          Prize: $20,000  │
│  ├─ Track A: World ID 4.0 ($8K)                           │
│  │  "Protocol breaks without proof-of-human"               │
│  │  → ZKP verification in smart contract                   │
│  │  → Sybil resistance = core Nash assumption              │
│  │                                                         │
│  ├─ Track B: MiniKit 2.0 ($4K)                            │
│  │  "Mini App deployed on World Chain"                     │
│  │  → Full MiniKit SDK integration                         │
│  │  → Contracts on World Chain Sepolia                     │
│  │                                                         │
│  └─ Track C: AgentKit ($8K) ← BONUS if time allows        │
│     "Liquidation agent with World ID trust"                │
│     → Agent that auto-liquidates + earns bounty            │
│     → World ID ensures agent is human-backed               │
│                                                             │
│  PARTNER 2: ENS                            Prize: $10,000  │
│  ├─ Track A: Most Creative Use ($5K) ← PRIMARY            │
│  │  "ENS subnames as portable credit identity"             │
│  │  → .trustcircle.eth = on-chain credit profile           │
│  │  → Rep score + loan history in text records             │
│  │  → Subnames as trust signals, not just names            │
│  │                                                         │
│  └─ Track B: AI Agent ENS ($5K) ← if AgentKit built       │
│     "Liquidation agent fleet with ENS identities"          │
│     → agent.trustcircle.eth auto-discovers defaults        │
│                                                             │
│  PARTNER 3: ARC (CIRCLE)                   Prize: $15,000  │
│  ├─ Track A: Advanced Stablecoin Logic ($3K) ← PRIMARY    │
│  │  "Social escrow + insurance pool + tiered yield +       │
│  │   proportional slashing — all in USDC"                  │
│  │  → Conditional escrow (vouch → borrow → repay/slash)    │
│  │  → Programmable yield (80/20 split, tier-based rates)   │
│  │  → Insurance pool mechanics                             │
│  │                                                         │
│  └─ Track B: Chain Abstracted ($3K) ← BONUS               │
│     "Borrow on World Chain, repay from Arc"                │
│     → Cross-chain USDC repayment                           │
│                                                             │
│  MAXIMUM PRIZE CEILING: $20K + $10K + $15K = $45,000      │
│  REALISTIC TARGET: $4K + $2.5K + $3K = $9,500 (3rd place) │
│  GOOD TARGET: $8K + $5K + $3K = $16,000 (1st/2nd)         │
│                                                             │
│  + ETHGlobal Finalist Track (separate, not counted)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Why These 3 (and Not Others)

```
WORLD:  Our product literally doesn't work without World ID.
        Judges want "breaks without proof of human" — we ARE that.
        MiniKit deployment is already planned. Free double-dip.

ENS:    Credit identity via subnames is genuinely creative.
        No one else will use ENS for credit scoring / trust profiles.
        Judges want "beyond name-to-address lookups" — we deliver.

ARC:    Our entire protocol is advanced USDC logic.
        Conditional escrow, tiered yield, insurance pool, slashing —
        this is EXACTLY what their bounty describes.
        Deploying same Solidity to Arc = minimal extra work.
```

---

## 2. What We're Building (Final Product Spec)

### The Pitch (10 seconds)

> "Trust Circle turns your social network into your credit score.
> Borrow without collateral, backed by people who trust you.
> Nash-balanced: every player's selfish strategy IS the cooperative outcome."

### Core System

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRUST CIRCLE V2 (Nash-Balanced)               │
│                                                                  │
│  IDENTITY          LENDING            PROTECTION                │
│  ├─ World ID 4.0   ├─ 7 Rep Tiers     ├─ Insurance Pool (1%)   │
│  ├─ ENS Subnames    ├─ Tiered Rates    ├─ 30% Loss Coverage     │
│  └─ Credit Profile  │  (2% - 15%)      ├─ 7-Day Grace Period    │
│                     ├─ Graduated Limits ├─ Circuit Breakers      │
│                     │  ($100 → $100K)   └─ Liquidation Bounty   │
│                     ├─ 48h Vouch Delay      (1-5% time-decay)   │
│                     ├─ 3-5 Min Vouchers                         │
│                     ├─ 40% Concentration Cap                    │
│                     └─ Rep Decay + Freeze                       │
│                                                                  │
│  DEPLOYED ON: World Chain Sepolia + Arc Testnet                  │
│  FRONTEND: Next.js MiniKit Mini App                              │
│  IDENTITY: *.trustcircle.eth (L2 Subnames)                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Tech Infrastructure

### 3.1 Contract Architecture (V2 — Full Rewrite)

```
contracts/
├── core/
│   ├── TrustCircleV2.sol          # Main protocol (rewritten)
│   │   ├── Registration (World ID 4.0)
│   │   ├── Vouching (48h delay, concentration caps)
│   │   ├── Borrowing (tier-gated, min voucher count)
│   │   ├── Repayment (overpayment refund, grace period)
│   │   └── Liquidation (bounty, insurance payout)
│   │
│   ├── ReputationEngine.sol       # NEW — tier system + decay
│   │   ├── 7 tiers: Frozen → Leader
│   │   ├── +10 repay, -50 default, -10 late
│   │   ├── Decay: -5/month after 90 days
│   │   ├── Freeze: Rep < 100 = can't borrow
│   │   ├── Cooldown: 30 days after default
│   │   └── Voucher multiplier (0.5x - 1.5x)
│   │
│   ├── InsurancePool.sol          # NEW — loss protection
│   │   ├── Fund: 1% of every loan principal
│   │   ├── Cover: 30% of voucher losses
│   │   ├── Pay: liquidation bounties
│   │   └── Track: contributions, payouts, balance
│   │
│   └── CircuitBreaker.sol         # NEW — system health
│       ├── Track: defaults in rolling 7-day window
│       ├── GREEN: < 10% default rate
│       ├── YELLOW: >= 10% → limits halved, rates +50%
│       ├── RED: >= 20% → new loans blocked
│       └── RECOVERY: <= 5% → 14-day normalization to GREEN
│
├── identity/
│   └── TrustCircleENS.sol         # L2 subname registry (keep, minor updates)
│       ├── Claim subname
│       ├── Forward + reverse resolution
│       ├── Link mainnet ENS
│       └── NEW: Store rep tier in text records
│
├── interfaces/
│   ├── IWorldID.sol               # World ID 4.0 interface
│   ├── IARC.sol                   # ARC staking interface
│   ├── IERC20.sol                 # Standard ERC20
│   ├── IReputationEngine.sol      # NEW
│   ├── IInsurancePool.sol         # NEW
│   └── ICircuitBreaker.sol        # NEW
│
├── libraries/
│   ├── ReentrancyGuard.sol        # Keep
│   ├── Pausable.sol               # Keep
│   └── TierLib.sol                # NEW — tier calculation logic
│
├── mocks/
│   ├── MockWorldID.sol            # Keep
│   ├── MockARC.sol                # Keep
│   └── MockERC20.sol              # Keep
│
└── deploy/
    ├── DeployWorldChain.s.sol     # Deploy to World Chain Sepolia
    └── DeployArc.s.sol            # Deploy to Arc Testnet
```

### 3.2 Contract: TrustCircleV2.sol (Key Changes from V1)

```solidity
// NEW STATE VARIABLES
ReputationEngine public immutable repEngine;
InsurancePool public immutable insurance;
CircuitBreaker public immutable breaker;

uint256 public constant VOUCH_ACTIVATION_DELAY = 48 hours;
uint256 public constant GRACE_PERIOD = 7 days;
uint256 public constant LATE_FEE_BPS = 200;
uint256 public constant DEFAULT_COOLDOWN = 30 days;
uint256 public constant MIN_VOUCH_AMOUNT = 10e6;         // $10 (raised from $1)
uint256 public constant MAX_VOUCHES_PER_USER = 5;
uint256 public constant MAX_CONCENTRATION_BPS = 4000;     // 40%
uint256 public constant INSURANCE_CONTRIBUTION_BPS = 100;  // 1%

// CHANGED: Vouch struct
struct Voucher {
    uint256 amount;
    uint256 usedAmount;
    uint256 stakeId;
    bool isActive;
    uint256 createdAt;
    uint256 activatesAt;     // NEW: 48h after creation
}

// CHANGED: Loan struct
struct Loan {
    address borrower;
    uint256 principal;
    uint256 interestRate;    // NOW: tier-based, not global
    uint256 totalDue;
    uint256 amountRepaid;
    uint256 borrowedAt;
    uint256 dueDate;
    uint256 gracePeriodEnd;  // NEW: dueDate + 7 days
    LoanStatus status;
    address[] vouchers;
    uint256[] voucherAmounts;
    uint256 insuranceContribution; // NEW
}

// NEW: User struct additions
struct User {
    bool isRegistered;
    uint256 nullifierHash;
    uint256 reputationScore;
    uint256 totalVouchesReceived;
    uint256 totalBorrowed;
    uint256 registeredAt;
    uint256 lastActivityAt;         // NEW: for rep decay
    uint256 defaultCooldownUntil;   // NEW: freeze after default
    uint256 activeVouchCount;       // NEW: max 5
}

// CHANGED FUNCTIONS:
// borrow() → checks tier limits, min voucher count, concentration, circuit breaker
// repayLoan() → handles grace period, late fees, overpayment refund
// liquidateDefaultedLoan() → grace period check, bounty payout, insurance coverage
// vouchForUser() → 48h activation delay, max 5 positions, concentration check
// _calculateAvailableLimit() → only counts activated vouches, applies voucher multiplier
```

### 3.3 Contract: ReputationEngine.sol

```solidity
// TIER DEFINITIONS
struct Tier {
    uint256 minRep;
    uint256 maxBorrow;      // in USDC (6 decimals)
    uint256 interestBps;    // basis points
    uint256 maxDuration;    // seconds
    uint256 minVouchers;    // minimum unique vouchers required
}

// 7 TIERS
Tier[7] public tiers = [
    Tier(0,   0,           0,    0,        0),  // Frozen
    Tier(100, 100e6,       1500, 14 days,  1),  // Newcomer
    Tier(200, 500e6,       1200, 21 days,  3),  // Rising
    Tier(300, 2_000e6,     800,  30 days,  3),  // Building
    Tier(500, 10_000e6,    500,  60 days,  3),  // Trusted
    Tier(700, 50_000e6,    300,  90 days,  5),  // Established
    Tier(900, 100_000e6,   200,  180 days, 5),  // Leader
];

// FUNCTIONS
function getTier(uint256 rep) → returns Tier
function getEffectiveRep(address user) → applies decay
function updateRep(address user, int256 change) → bounded 0-1000
function getVoucherMultiplier(uint256 voucherRep) → 5000-15000 (0.5x-1.5x in bps)
function isAccountFrozen(address user) → rep < 100 || cooldown active
```

### 3.4 Contract: InsurancePool.sol

```solidity
uint256 public poolBalance;
uint256 public totalContributions;
uint256 public totalPayouts;
uint256 public constant COVERAGE_BPS = 3000; // 30%

function contribute(uint256 amount) external;           // Called by TrustCircle on borrow
function claimCoverage(address voucher, uint256 loss)   // Called on liquidation
    external returns (uint256 covered);                 // Returns actual amount covered
function payBounty(address liquidator, uint256 amount)  // Called on liquidation
    external;
function getBalance() external view returns (uint256);
```

### 3.5 Contract: CircuitBreaker.sol

```solidity
enum SystemHealth { GREEN, YELLOW, RED, RECOVERY }

uint256 public activeLoans;
uint256 public defaultsLast7Days;
uint256[] public defaultTimestamps;  // rolling window

function recordLoan() external;             // Called on borrow
function recordDefault() external;          // Called on liquidation
function recordRepayment() external;        // Called on repay
function getHealth() external view returns (SystemHealth);
function getEffectiveMaxBorrow(uint256 tierMax) → applies Yellow penalty
function getEffectiveRate(uint256 tierRate) → applies Yellow penalty
function canCreateLoan() external view returns (bool); // false if RED
```

### 3.6 Frontend Architecture

```
frontend/
├── app/
│   ├── layout.tsx                  # Providers: wagmi, MiniKit, TanStack Query
│   ├── page.tsx                    # Landing / marketing
│   ├── onboard/
│   │   ├── page.tsx                # World ID 4.0 verification
│   │   └── claim-name/page.tsx     # ENS subname claim
│   ├── dashboard/page.tsx          # Profile + tier + loans + health
│   ├── borrow/page.tsx             # Tier-aware borrow flow
│   ├── vouch/
│   │   ├── page.tsx                # Search + vouch (48h notice)
│   │   └── [address]/page.tsx      # Vouch for specific user
│   ├── repay/page.tsx              # Repay + grace period handling
│   ├── circle/page.tsx             # My circle view
│   ├── profile/[address]/page.tsx  # Public profile (rep, tier, history)
│   └── api/
│       ├── verify/route.ts         # World ID backend verification
│       ├── tiers/route.ts          # Tier data + user tier
│       ├── insurance/route.ts      # Pool stats
│       ├── health/route.ts         # Circuit breaker status
│       └── notify/route.ts         # Telegram dispatch
│
├── components/
│   ├── providers/
│   │   ├── Web3Provider.tsx        # wagmi + MiniKit 2.0
│   │   └── QueryProvider.tsx       # TanStack Query
│   ├── dashboard/
│   │   ├── ProfileCard.tsx         # Name + rep + TIER BADGE
│   │   ├── TierProgress.tsx        # Current tier → next tier
│   │   ├── CreditLimitBar.tsx      # Available / tier max
│   │   ├── ActiveLoanCard.tsx      # Due date + grace period
│   │   ├── SystemHealthBadge.tsx   # GREEN / YELLOW / RED
│   │   └── InsuranceInfo.tsx       # Pool balance + "30% covered"
│   ├── borrow/
│   │   ├── TierInfoCard.tsx        # Your limits + rate
│   │   ├── AmountSlider.tsx        # Capped by tier + vouches
│   │   ├── TermsPreview.tsx        # Rate, duration, insurance
│   │   ├── VoucherBreakdown.tsx    # Who backs this + activation
│   │   ├── DefaultWarning.tsx      # Clear consequences
│   │   └── ConfirmBorrow.tsx       # Sign + submit
│   ├── vouch/
│   │   ├── UserSearch.tsx          # ENS resolution
│   │   ├── BorrowerCard.tsx        # Rep tier + history
│   │   ├── VouchAmountInput.tsx    # Amount + concentration check
│   │   ├── ActivationNotice.tsx    # "Activates in 48 hours"
│   │   └── ConfirmVouch.tsx        # Approve + vouch
│   └── shared/
│       ├── TierBadge.tsx           # Color-coded tier name
│       ├── RepScore.tsx            # Score + decay indicator
│       ├── LoanStatus.tsx          # Active/Grace/Repaid/Defaulted
│       ├── CountdownTimer.tsx      # Reusable countdown
│       └── TxButton.tsx            # Approve → Execute
│
├── hooks/
│   ├── useTrustCircle.ts           # Core contract reads/writes
│   ├── useReputation.ts            # Tier, score, decay
│   ├── useInsurance.ts             # Pool stats
│   ├── useCircuitBreaker.ts        # System health
│   ├── useENS.ts                   # Subname resolution
│   ├── useMiniKit.ts               # World ID proof flow
│   └── useNotifications.ts         # Telegram bot linking
│
├── lib/
│   ├── contracts.ts                # Addresses + ABIs
│   ├── tiers.ts                    # Tier definitions (mirrors on-chain)
│   ├── constants.ts                # All protocol constants
│   └── utils.ts                    # Formatters, helpers
│
└── public/
    └── abi/
        ├── TrustCircleV2.json
        ├── ReputationEngine.json
        ├── InsurancePool.json
        ├── CircuitBreaker.json
        ├── TrustCircleENS.json
        └── MockERC20.json
```

### 3.7 Backend (Minimal)

```
Supabase (Postgres):
  - users (cached from on-chain + circles membership)
  - circles (off-chain groups)
  - vouch_cache (with activates_at countdown)
  - loan_cache (with grace_period_end)
  - insurance_pool (cached balance)
  - system_health (cached status)
  - notification_prefs (telegram chat IDs)

Vercel Cron Jobs:
  - Every 1h: Check loan due dates → send reminders
  - Every 1h: Check grace periods → alert vouchers
  - Every 1h: Check vouch activations → notify
  - Every 1h: Recalculate system health → update circuit breaker cache

Telegram Bot:
  - 15 notification types (see MVP_INFRA.md)
  - /start → link wallet address
  - /status → check your rep + active loans
```

### 3.8 Deployment Targets

```
CHAIN 1: World Chain Sepolia (Chain ID: 4801)
  → All contracts deployed here (primary)
  → MiniKit Mini App connects here
  → World ID verification happens here

CHAIN 2: Arc Testnet
  → Same contracts deployed (secondary)
  → For Arc (Circle) bounty submission
  → Shows cross-chain capability

FRONTEND: Vercel
  → Next.js 14 App Router
  → Free tier during hackathon
  → Auto-deploy from GitHub
```

---

## 4. Execution Plan (Day by Day)

### Pre-Hackathon (Now → Event Start)

```
□ Set up monorepo structure:
    /contracts  — Hardhat + Solidity
    /frontend   — Next.js 14
    /backend    — Supabase schema + Telegram bot

□ Scaffold all contracts (interfaces + stubs)
□ Scaffold Next.js with wagmi + MiniKit
□ Get World ID developer credentials (app_staging_trustcircle)
□ Get Arc testnet access + faucet tokens
□ Set up Supabase project
□ Create Telegram bot via @BotFather
□ Register .trustcircle.eth (or decide on test name)
```

### Day 1: Contracts

```
Morning:
  □ ReputationEngine.sol — full implementation + tests
  □ InsurancePool.sol — full implementation + tests

Afternoon:
  □ TrustCircleV2.sol — core rewrite:
    □ Registration (World ID 4.0)
    □ Vouching (48h delay, concentration caps, max 5)
    □ Borrowing (tier-gated, min vouchers, insurance contrib)
  □ TrustCircleV2.sol — continued:
    □ Repayment (grace period, late fees, overpayment refund)
    □ Liquidation (bounty, insurance payout, cooldown)

Evening:
  □ CircuitBreaker.sol — implementation
  □ Integration tests — full lifecycle
  □ Deploy to World Chain Sepolia
  □ Deploy to Arc Testnet
  □ Export ABIs + addresses
```

### Day 2: Frontend Core

```
Morning:
  □ Providers setup (wagmi, MiniKit, TanStack Query)
  □ Layout + navigation (mobile-first)
  □ Onboarding: World ID 4.0 verification page
  □ Onboarding: ENS subname claim page

Afternoon:
  □ Dashboard: ProfileCard + TierProgress + CreditLimitBar
  □ Dashboard: ActiveLoanCard + SystemHealthBadge
  □ Borrow flow: TierInfo → Amount → Terms → Warning → Confirm
  □ Vouch flow: Search → Profile → Amount → 48h notice → Confirm

Evening:
  □ Repay flow: Balance → Grace period handling → Confirm
  □ Profile page: Public rep + tier + loan history
  □ All contract hooks working end-to-end
```

### Day 3: Polish + Bounty Requirements

```
Morning:
  □ ENS integration polish (for ENS bounty):
    □ Subname resolution in all flows
    □ Rep score in ENS text records
    □ Credit profile via ENS lookup
  □ Error handling for all custom errors
  □ Loading states + tx tracking

Afternoon:
  □ Arc deployment verification (for Arc bounty)
  □ Architecture diagram (Arc requires this)
  □ Telegram bot setup + basic notifications
  □ Mobile responsiveness pass

Evening:
  □ Demo video recording (max 3 min):
    □ Register with World ID
    □ Claim .trustcircle.eth name
    □ Get vouched by 3 friends
    □ Borrow $100 (Newcomer tier, 15%)
    □ Repay + see rep go up + tier info
    □ Show insurance pool + system health
  □ README + submission writeup
  □ GitHub repo cleanup
```

---

## 5. Submission Strategy

### For Each Partner Prize

**Partner 1: World**
```
Integration: World ID 4.0 + MiniKit 2.0
Key message: "Lending that BREAKS without proof-of-human.
  World ID prevents Sybil attacks — the core Nash assumption.
  Without it, collusion attacks become profitable."
Show: ZKP verification in contract, MiniKit proof flow, World Chain deploy
Eligible tracks: World ID 4.0 ($8K) + MiniKit 2.0 ($4K) = $12K ceiling
```

**Partner 2: ENS**
```
Integration: L2 subname registry + credit identity
Key message: "ENS subnames as PORTABLE CREDIT PROFILES.
  Not just names — trust signals. fatma.trustcircle.eth carries
  her rep score, loan history, and tier status."
Show: Subname claim, forward/reverse resolution, rep in text records
Eligible tracks: Most Creative Use ($5K)
Present at ENS booth Sunday morning (required!)
```

**Partner 3: Arc (Circle)**
```
Integration: Advanced USDC logic on Arc
Key message: "The most sophisticated USDC escrow ever built.
  Conditional release, tiered yield distribution, proportional
  slashing, insurance pool — all programmable in USDC."
Show: Contracts on Arc testnet, architecture diagram, demo video
Eligible tracks: Advanced Stablecoin Logic ($3K)
```

### ETHGlobal Finalist (Separate)
```
Key message: "Nash-balanced social lending. Game theory proves
  every player's selfish strategy = cooperative outcome.
  Not hope-based. Math-based."
Differentiator vs Credit app: decentralized, transparent, higher ceiling
Show: Full system working, game theory proofs, real demo
```

---

## 6. File Structure (Final)

```
Trust-Circle/
├── contracts/
│   ├── core/
│   │   ├── TrustCircleV2.sol
│   │   ├── ReputationEngine.sol
│   │   ├── InsurancePool.sol
│   │   └── CircuitBreaker.sol
│   ├── identity/
│   │   └── TrustCircleENS.sol
│   ├── interfaces/
│   │   ├── IWorldID.sol
│   │   ├── IARC.sol
│   │   ├── IERC20.sol
│   │   ├── IReputationEngine.sol
│   │   ├── IInsurancePool.sol
│   │   └── ICircuitBreaker.sol
│   ├── libraries/
│   │   ├── ReentrancyGuard.sol
│   │   ├── Pausable.sol
│   │   └── TierLib.sol
│   └── mocks/
│       ├── MockWorldID.sol
│       ├── MockARC.sol
│       └── MockERC20.sol
│
├── test/
│   ├── TrustCircleV2.test.js
│   ├── ReputationEngine.test.js
│   ├── InsurancePool.test.js
│   ├── CircuitBreaker.test.js
│   ├── TrustCircleENS.test.js
│   └── Integration.test.js
│
├── scripts/
│   ├── deploy-worldchain.js
│   └── deploy-arc.js
│
├── frontend/
│   ├── app/               # Next.js 14 pages
│   ├── components/        # React components
│   ├── hooks/             # Contract + UI hooks
│   ├── lib/               # Utilities
│   ├── public/abi/        # Contract ABIs
│   ├── package.json
│   └── next.config.js
│
├── bot/
│   └── telegram.ts        # Notification bot
│
├── docs/
│   ├── HACKATHON_IDEA.md  # Problem + solution
│   ├── PRD.md             # Product requirements
│   ├── GAPS.md            # Gap analysis (mostly closed)
│   ├── MVP_INFRA.md       # Infrastructure spec
│   ├── GAME_THEORY.md     # Nash equilibrium proofs
│   ├── SYSTEM_FIX.md      # 14 Nash-balanced fixes
│   ├── FINAL_PLAN.md      # This document
│   └── tracks.md          # Hackathon tracks reference
│
├── hardhat.config.js
├── package.json
└── README.md
```

---

## 7. What to Build First (Priority Order)

```
MUST HAVE (demo won't work without these):
  1. ReputationEngine.sol — tiers gate everything
  2. TrustCircleV2.sol — core lending with all Nash fixes
  3. InsurancePool.sol — loss protection
  4. Frontend: Onboard → Dashboard → Borrow → Vouch → Repay
  5. World ID integration (MiniKit proof flow)
  6. ENS subname claim + resolution in UI

SHOULD HAVE (strengthens submission):
  7. CircuitBreaker.sol — system health
  8. TrustCircleENS text record updates (rep in ENS)
  9. Arc testnet deployment
  10. Telegram notifications (at least due-date reminders)

NICE TO HAVE (if time allows):
  11. AgentKit liquidation bot (unlocks $8K World track)
  12. Architecture diagram for Arc submission
  13. Achievement badges
  14. Circle groups UI
```

---

## 8. Risk Mitigation

```
RISK: Contract V2 takes too long
MITIGATION: Build ReputationEngine + InsurancePool as separate contracts
  that TrustCircleV2 calls. If time runs out, deploy V1 with just the
  reputation tier check added inline. Expand later.

RISK: MiniKit integration issues
MITIGATION: Build as standard web app first (works in browser).
  Add MiniKit wrapper as final step. Both count for submission.

RISK: Arc testnet unavailable
MITIGATION: Arc is EVM-compatible. Same Solidity compiles.
  If testnet is down, show architecture diagram + explain the deploy.
  Still qualifies for the bounty.

RISK: ENS booth presentation on Sunday
MITIGATION: Prepare 2-minute demo script in advance.
  Practice: claim name → resolve → show credit profile → done.

RISK: Too many features, nothing works
MITIGATION: Priority order above. Ship working core first.
  A polished 5-screen app beats a broken 15-screen app.
```
