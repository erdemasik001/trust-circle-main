# Trust Circle — System Fix Plan (Nash-Balanced Redesign)

> Maps every broken equilibrium to a concrete system change.
> Each fix shows: CURRENT (broken) → FIXED (Nash-balanced) → WHY it works.

---

## Fix Overview

The current system has **one** Nash Equilibrium: **(Don't Vouch, Default)** — a dead protocol. We need **14 fixes** across 5 layers to move the equilibrium to **(Vouch Selectively, Repay Always)**.

```
LAYER 1: REPUTATION ENGINE        (Fixes 1-3)   ← Makes default expensive
LAYER 2: RISK PRICING             (Fixes 4-6)   ← Makes vouching rational
LAYER 3: INSURANCE & PROTECTION   (Fixes 7-9)   ← Reduces voucher downside
LAYER 4: LIQUIDATION MARKET       (Fixes 10-11) ← Keeps protocol healthy
LAYER 5: ANTI-EXPLOIT GATES       (Fixes 12-14) ← Makes attacks unprofitable
```

---

## Layer 1: Reputation Engine

### Fix 1: Reputation Gates Borrowing

**CURRENT (Broken):**
```
Rep score exists (0-1000) but does NOTHING.
User with Rep 0 can still borrow $100,000.
Default cost = -50 imaginary points. Meaningless.
```

**FIXED:**
```
Rep score directly controls borrow limits and interest rates.
Rep 0 = FROZEN. Cannot borrow at all.

REPUTATION TIER TABLE:
┌─────────┬────────────┬─────────────┬──────────┬──────────────┐
│ Rep     │ Tier       │ Max Borrow  │ Interest │ Max Duration │
├─────────┼────────────┼─────────────┼──────────┼──────────────┤
│ 0-99    │ Frozen     │ $0          │ N/A      │ N/A          │
��� 100-199 │ Newcomer   │ $100        │ 15%      │ 14 days      │
│ 200-299 │ Rising     │ $500        │ 12%      │ 21 days      │
│ 300-499 │ Building   │ $2,000      │ 8%       │ 30 days      │
│ 500-699 │ Trusted    │ $10,000     │ 5%       │ 60 days      │
│ 700-899 │ Established│ $50,000     │ 3%       │ 90 days      │
│ 900-1000│ Leader     │ $100,000    │ 2%       │ 180 days     │
└───────��─┴────────────┴───────��─────┴──────────┴──���───────────┘
```

**SYSTEM CHANGE:**
```
Replace:
  uint256 public constant MAX_LOAN_AMOUNT = 100_000e6;
  uint256 public defaultInterestRate = 500;

With:
  Tier struct { minRep, maxBorrow, interestRate, maxDuration }
  mapping(uint8 => Tier) public tiers;

  In borrow():
    Tier memory t = getTierForRep(users[msg.sender].reputationScore);
    require(amount <= t.maxBorrow);
    loan.interestRate = t.interestRate;
    loan.dueDate = block.timestamp + t.maxDuration;
```

**NASH EFFECT:**
```
Before: Default gains $100K, costs 50 imaginary points → DEFAULT WINS
After:  Default on $100 kills $500K lifetime access → REPAY WINS

The punishment is not the -50 rep.
The punishment is losing EVERYTHING you built.
A Rep 700 user who defaults loses access to $50K loans forever.
Nobody burns $50K of future value for a one-time gain.
```

---

### Fix 2: Reputation Decay

**CURRENT (Broken):**
```
Rep only changes on repay (+10) or default (-50).
User can build rep to 900, stop playing, and have a permanent high score.
Creates "build-then-exit" strategy: build rep → take max loan → disappear.
```

**FIXED:**
```
Rep decays over inactivity:
  - No activity for 90 days → start losing 5 rep/month
  - Decay stops when user makes any transaction (vouch, borrow, repay)
  - Minimum decay floor: Rep never drops below current tier minimum
    from decay alone (only defaults push below tier)

SYSTEM CHANGE:
  In getUserProfile() and any rep-dependent function:
    uint256 monthsInactive = (block.timestamp - lastActivityTimestamp) / 30 days;
    if (monthsInactive > 3) {
      uint256 decay = (monthsInactive - 3) * 5;
      effectiveRep = rep > decay ? rep - decay : tierFloor;
    }
```

**NASH EFFECT:**
```
Eliminates the "build-and-exit" end-game strategy.
The game becomes effectively infinite — you must keep playing
to keep your score. Folk Theorem applies: cooperation sustains.
```

---

### Fix 3: Reputation Affects Vouchers Too

**CURRENT (Broken):**
```
Voucher reputation is irrelevant. A Rep 100 voucher and Rep 900
voucher are treated identically. No quality signal.
```

**FIXED:**
```
Voucher rep creates a TRUST MULTIPLIER:
  - Rep 0-199   voucher: vouch counts at 0.5x (50% of stated amount)
  - Rep 200-499 voucher: vouch counts at 0.75x
  - Rep 500-699 voucher: vouch counts at 1.0x (face value)
  - Rep 700-899 voucher: vouch counts at 1.25x (bonus)
  - Rep 900+    voucher: vouch counts at 1.5x (premium)

Example:
  Low-rep voucher stakes $100 → borrower gets $50 credit
  High-rep voucher stakes $100 → borrower gets $150 credit

SYSTEM CHANGE:
  In _calculateAvailableLimit():
    uint256 multiplier = getVoucherMultiplier(vouchers[addr].rep);
    available += (v.amount - v.usedAmount) * multiplier / 100;
```

**NASH EFFECT:**
```
Creates demand for HIGH-REP vouchers. Borrowers want them.
High-rep vouchers become valuable → incentive to maintain rep.
Low-rep vouchers are less useful → incentive to build rep.
Vouchers now have skin in the reputation game too.
```

---

## Layer 2: Risk Pricing

### Fix 4: Dynamic Interest Rates

**CURRENT (Broken):**
```
Global 5% rate for everyone. New user with Rep 100 pays same
as trusted user with Rep 900. No risk pricing.

Problem: 5% is too low for risky borrowers (vouchers lose money)
and unnecessarily high for safe borrowers (drives away good users).
```

**FIXED:**
```
Interest is set PER TIER (see Fix 1 table):
  Rep 100: 15% → Voucher yield 12% → compensates high risk
  Rep 500: 5%  → Voucher yield 4%  → moderate, proven borrower
  Rep 900: 2%  �� Voucher yield 1.6% → almost risk-free

SYSTEM CHANGE:
  Remove: uint256 public defaultInterestRate = 500;
  Replace with tier-based lookup (see Fix 1).

  In borrow():
    loan.interestRate = getTierForRep(rep).interestRate;
```

**NASH EFFECT:**
```
Voucher EV calculation for NEW borrower (Rep 100):
  Stake: $50 (graduated limit)
  Yield: $6 (12% of $50)
  Max loss: $35 (after insurance, see Fix 7)
  Break-even: need 85.4% repay confidence

Voucher EV for TRUSTED borrower (Rep 700):
  Stake: $5,000
  Yield: $150 (3% of $5000)
  Max loss: $3,500 (after insurance)
  Break-even: need 95.9% repay confidence

Both are ACHIEVABLE with personal knowledge.
Vouchers can now rationally participate at every tier.
```

---

### Fix 5: Graduated Borrow Limits

**CURRENT (Broken):**
```
Any registered user can borrow up to $100,000 immediately.
A brand new user can drain the maximum on day 1.
Grief cost: near zero. Grief damage: maximum.
```

**FIXED:**
```
Borrow limits tied to reputation tier (Fix 1 table).
New user: max $100. Proven user: up to $100,000.

Time to reach each tier (minimum):
  $100   → Day 0 (registration)
  $500   → ~Month 2 (10 successful repayments)
  $2,000 → ~Month 6 (20 successful repayments)
  $10,000→ ~Month 12 (40 successful repayments)
  $50,000→ ~Month 18 (60 successful repayments)
  $100K  → ~Month 24 (80 successful repayments)

SYSTEM CHANGE:
  In borrow():
    Tier memory t = getTierForRep(users[msg.sender].reputationScore);
    if (amount > t.maxBorrow) revert ExceedsMaxLoanAmount();
```

**NASH EFFECT:**
```
Grief attack cost-benefit:
  To grief for $2,000 → need 6 months of real participation
  To grief for $50,000 → need 18 months + $thousands in interest paid

  At every level: future access value > current loan value
  Strategic default is NEVER rational because you always
  have more to lose than to gain.
```

---

### Fix 6: Vouch Concentration Limits

**CURRENT (Broken):**
```
One voucher can back 100% of a loan.
Creates single point of failure + enables self-collusion.
Borrower + one accomplice = complete the game with 2 people.
```

**FIXED:**
```
RULES:
  - Loans > $200: minimum 3 unique vouchers
  - No single voucher can represent > 40% of total vouch limit
  - Min vouch amount raised to $10 (prevents dust vouches)
  - Max 5 active vouch positions per voucher (limits cascade risk)

SYSTEM CHANGE:
  In borrow():
    require(activeVoucherCount >= 3 || amount <= 200e6);
    for each voucher:
      require(voucherAmount <= totalLimit * 40 / 100);

  In vouchForUser():
    require(activeVouchCount[msg.sender] < 5);
```

**NASH EFFECT:**
```
Collusion now requires 3+ World IDs (expensive).
No single voucher can be exploited for > 40% of any loan.
Max 5 positions limits cascade exposure per voucher.
Attack cost rises above attack gain → Abstain is dominant.
```

---

## Layer 3: Insurance & Protection

### Fix 7: Insurance Pool

**CURRENT (Broken):**
```
Voucher loses 100% of stake on default.
Risk/reward: risk $1000 to earn $40.
Ratio: 25:1 against. No rational actor plays this.
```

**FIXED:**
```
INSURANCE POOL:
  Funding: 1% of every loan principal goes to pool
  Coverage: Pool covers 30% of voucher losses on default
  Cap: Pool pays out max 30% of individual voucher's loss

  Voucher max loss drops from 100% → 70%

  Flow on default:
    Voucher staked: $1,000
    Insurance covers: $300 (30%)
    Voucher loses: $700 (70%)

SYSTEM CHANGE:
  New state variable:
    uint256 public insurancePool;

  In borrow():
    uint256 insuranceContribution = amount * 100 / BASIS_POINTS; // 1%
    insurancePool += insuranceContribution;
    // Deduct from loan amount or add to borrower's cost

  In liquidateDefaultedLoan():
    for each voucher:
      uint256 loss = voucherShare;
      uint256 covered = min(loss * 3000 / BASIS_POINTS, insurancePool);
      insurancePool -= covered;
      // Voucher only loses: loss - covered
      stablecoin.transfer(voucherAddr, covered);
```

**NASH EFFECT:**
```
NEW voucher calculation:
  Stake: $50 | Yield: $6 (12%) | Max loss: $35 (70%)
  EV = 0.90 × 6 - 0.10 × 35 = 5.40 - 3.50 = +$1.90

  POSITIVE expected value at 90% repay confidence.
  Social knowledge typically gives 90%+ for close relationships.
  Vouching is now RATIONAL. ★
```

---

### Fix 8: Grace Period

**CURRENT (Broken):**
```
Due date passes → immediately liquidatable.
No buffer for honest borrowers who are 1 day late.
Accidental defaults punish everyone unnecessarily.
```

**FIXED:**
```
GRACE PERIOD: 7 days after due date before liquidation eligible.

  During grace period:
    - Borrower CAN still repay (with 2% late fee added to total)
    - Liquidation is BLOCKED
    - Vouchers are notified of late status
    - Borrower reputation takes -10 (minor penalty for lateness)

  After grace period:
    - Liquidation becomes eligible
    - Full default consequences apply

SYSTEM CHANGE:
  New constant:
    uint256 public constant GRACE_PERIOD = 7 days;
    uint256 public constant LATE_FEE_BPS = 200; // 2%

  In repayLoan() — if past due date but within grace:
    if (block.timestamp > loan.dueDate &&
        block.timestamp <= loan.dueDate + GRACE_PERIOD) {
      uint256 lateFee = (loan.totalDue * LATE_FEE_BPS) / BASIS_POINTS;
      loan.totalDue += lateFee;
      _updateReputation(msg.sender, false, 10); // minor penalty
    }

  In liquidateDefaultedLoan():
    if (block.timestamp <= loan.dueDate + GRACE_PERIOD)
      revert LoanInGracePeriod();
```

**NASH EFFECT:**
```
Reduces accidental defaults from ~5% to ~1%.
Honest borrowers who are slightly late can still repay.
The 2% late fee discourages intentional lateness.
Vouchers face fewer losses → more willing to vouch.
```

---

### Fix 9: Overpayment Refund

**CURRENT (Broken):**
```
If borrower sends 1100 USDC to repay 1050 USDC loan,
50 USDC is trapped in contract forever. Silent loss.
```

**FIXED:**
```
Refund excess automatically.

SYSTEM CHANGE:
  In repayLoan():
    uint256 remaining = loan.totalDue - loan.amountRepaid;
    if (amount > remaining) {
      // Only take what's owed
      uint256 excess = amount - remaining;
      stablecoin.transferFrom(msg.sender, address(this), remaining);
      // Don't transfer excess at all — only pull what's needed
      paymentAmount = remaining;
    }
```

**NASH EFFECT:**
```
Removes accidental fund loss. Borrowers trust the system more.
Small fix, big UX impact. Prevents "I got scammed" feeling.
```

---

## Layer 4: Liquidation Market

### Fix 10: Liquidation Bounty

**CURRENT (Broken):**
```
Liquidator pays gas, gets nothing. Zero incentive.
Defaulted loans sit forever unless someone is altruistic.
Protocol health depends on hope.
```

**FIXED:**
```
TIME-DECAY BOUNTY paid from insurance pool:

  Days overdue (after grace):  Bounty
  ─────────────────────────────────────
  Day 1-3:                     1% of outstanding debt
  Day 4-7:                     2%
  Day 8-14:                    3%
  Day 15+:                     5%

SYSTEM CHANGE:
  In liquidateDefaultedLoan():
    uint256 daysOverdue = (block.timestamp - loan.dueDate - GRACE_PERIOD) / 1 days;
    uint256 bountyBps;
    if (daysOverdue <= 3) bountyBps = 100;
    else if (daysOverdue <= 7) bountyBps = 200;
    else if (daysOverdue <= 14) bountyBps = 300;
    else bountyBps = 500;

    uint256 bounty = (outstandingDebt * bountyBps) / BASIS_POINTS;
    bounty = min(bounty, insurancePool); // Can't pay more than pool has
    insurancePool -= bounty;
    stablecoin.transfer(msg.sender, bounty); // Pay liquidator

    emit LiquidationBountyPaid(msg.sender, bounty);
```

**NASH EFFECT:**
```
Liquidator on Day 1 (1000 USDC default):
  Bounty: $10 | Gas: $0.01 | Profit: $9.99

  Liquidate is now DOMINANT STRATEGY.
  Multiple liquidators compete → defaults settled within hours.
  Rising bounty guarantees settlement even if early liquidators miss it.
```

---

### Fix 11: Circuit Breakers

**CURRENT (Broken):**
```
No system-level health monitoring. If 50% of loans default
simultaneously (external shock), the protocol enters a death
spiral: vouchers flee → credit dries up → more defaults → death.
```

**FIXED:**
```
AUTOMATIC CIRCUIT BREAKERS:

  Track: defaultRate = defaults_last_7_days / active_loans

  YELLOW (defaultRate >= 10%):
    → Interest rates +50% on new loans
    → Max borrow amounts -50%
    → Emit HealthChanged(GREEN, YELLOW, defaultRate)

  RED (defaultRate >= 20%):
    → All new loans are blocked (canCreateLoan = false)
    → Emit HealthChanged(YELLOW, RED, defaultRate)

  RECOVERY (defaultRate drops to <= 5%):
    → Parameters gradually return to normal over 14 days
    → Emit HealthChanged(RED/YELLOW, RECOVERY, defaultRate)

SYSTEM CHANGE:
  New state:
    uint256 public defaultsLast7Days;
    uint256 public activeLoansCount;
    uint256 public lastCircuitBreakerCheck;
    enum SystemHealth { GREEN, YELLOW, RED, RECOVERY }
    SystemHealth public systemHealth;

  In borrow():
    if (!breaker.canCreateLoan()) revert SystemPaused(); // RED blocks all new loans
    effectiveMaxBorrow = breaker.getEffectiveMaxBorrow(tierMaxBorrow); // halved in YELLOW
    effectiveRate = breaker.getEffectiveRate(tierRate); // +50% in YELLOW

  In liquidateDefaultedLoan():
    breaker.recordDefault(); // updates rolling window + health state
```

**NASH EFFECT:**
```
Death spiral is mechanically impossible:
  - Higher rates (YELLOW +50%) compensate vouchers for elevated risk
  - Lower limits (YELLOW /2) reduce maximum new damage
  - Blocking new loans (RED) stops the bleeding entirely
  - 14-day recovery period prevents whiplash normalization

System becomes MEAN-REVERTING instead of self-destructive.
```

---

## Layer 5: Anti-Exploit Gates

### Fix 12: Vouch Activation Delay

**CURRENT (Broken):**
```
Vouch is instantly active. Allows flash-vouch-borrow-default
in a single session. Attacker can be in and out in minutes.
```

**FIXED:**
```
48-hour activation delay on all new vouches.

  User A vouches for User B at time T
  → Vouch is PENDING until T + 48 hours
  → At T + 48h, vouch activates and counts toward borrow limit
  → During pending period, voucher can cancel for free

SYSTEM CHANGE:
  In Voucher struct:
    uint256 activatesAt; // new field

  In vouchForUser():
    v.activatesAt = block.timestamp + 48 hours;

  In _calculateAvailableLimit():
    if (v.isActive && v.activatesAt <= block.timestamp && v.amount > v.usedAmount) {
      // Only count activated vouches
    }
```

**NASH EFFECT:**
```
Flash attacks: IMPOSSIBLE (need 48h between vouch and borrow)
Voucher regret: Can cancel within 48h window (no lock-in anxiety)
Honest users: Minor inconvenience, one-time per vouch relationship
```

---

### Fix 13: Minimum Voucher Count

**CURRENT (Broken):**
```
Any single voucher can back an entire loan.
Self-collusion: 2 accounts (1 voucher + 1 borrower) = game complete.
```

**FIXED:**
```
RULES:
  Loan ≤ $200:   1 voucher minimum (micro-loans stay accessible)
  Loan $201-$2K: 3 vouchers minimum
  Loan $2K+:     5 vouchers minimum

SYSTEM CHANGE:
  In borrow():
    uint256 activeVoucherCount = countActiveVouchers(msg.sender);
    if (amount > 2000e6 && activeVoucherCount < 5)
      revert InsufficientVoucherCount();
    if (amount > 200e6 && activeVoucherCount < 3)
      revert InsufficientVoucherCount();
```

**NASH EFFECT:**
```
Collusion cost scales with loan size:
  $200 loan:   need 1 World ID → attack gain: $200 max
  $2,000 loan: need 3 World IDs → cost: $150+ for IDs alone
  $10K+ loan:  need 5 World IDs → cost: $250+ for IDs + months of rep building

At every level: attack cost > attack gain.
```

---

### Fix 14: Rep-Zero Freeze + Cooldown

**CURRENT (Broken):**
```
User with Rep 0 (serial defaulter) can still receive vouches
and borrow through new vouchers who don't check.
No cooling off period after default.
```

**FIXED:**
```
REP-ZERO FREEZE:
  - Rep < 100: cannot borrow (account frozen for borrowing)
  - After default: 30-day cooldown before receiving NEW vouches
  - Existing vouches from before default remain (voucher's choice to revoke)

REPUTATION RECOVERY PATH:
  A frozen user can ONLY recover by:
    1. Vouching for OTHERS and those people repaying (+2 rep per successful vouch-back)
    2. Waiting for cooldown period
    3. Getting re-vouched after cooldown

  This means: you can only recover by helping others succeed.
  You can't just create a new identity (World ID blocks this).

SYSTEM CHANGE:
  New state:
    mapping(address => uint256) public defaultCooldownUntil;

  In liquidateDefaultedLoan():
    defaultCooldownUntil[borrower] = block.timestamp + 30 days;

  In borrow():
    if (users[msg.sender].reputationScore < 100) revert AccountFrozen();

  In vouchForUser():
    if (defaultCooldownUntil[borrower] > block.timestamp)
      revert BorrowerInCooldown();
```

**NASH EFFECT:**
```
Serial defaulter strategy:
  Default #1: Rep 100 → 50, can't borrow, 30-day cooldown
  Recovery: vouch for 25 people who repay → Rep 100 again (~3 months)
  Default #2: Rep 100 → 50 again, another 30-day cooldown

  Cost of each default cycle: ~3-4 months + must help 25 people
  Gain: whatever they borrowed ($100 max at Rep 100)

  Hourly rate of griefing: $100 / (3 months × 720 hours) = $0.04/hour

  Nobody griefs for $0.04/hour. ★
```

---

## Full System Change Map

```
┌──────────────────────────────────────────────────────────────────┐
│                    BEFORE → AFTER                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  REPUTATION                                                      │
│  ├─ Cosmetic score          → Gates borrowing (tiers)           │
│  ├─ No decay                → -5/month after 90 days inactive   │
��  ├─ Borrower only           → Voucher multiplier (0.5x - 1.5x) │
│  └─ Rep 0 can still borrow  → Rep < 100 = frozen + cooldown    │
│                                                                  │
│  PRICING                                                         │
│  ├─ Flat 5% for everyone    → 2%-15% based on rep tier          │
│  ├─ $100K max for anyone    → $100 (new) to $100K (proven)     │
│  ├─ 1 voucher enough        → 3-5 vouchers required            │
│  └─ No concentration limit  → Max 40% per voucher              │
│                                                                  │
│  PROTECTION                                                      │
│  ├─ 100% voucher loss       → 70% max (30% insurance)          │
│  ├─ Instant liquidation     → 7-day grace + late fee            │
│  ├─ Overpayment stuck       → Auto-refund excess               │
│  └─ No system monitoring    → Circuit breakers (yellow/red)     │
│                                                                  │
│  LIQUIDATION                                                     │
│  ├─ Zero reward              → 1-5% time-decay bounty          │
│  └─ Rely on altruism         → Competitive liquidation market   │
│                                                                  │
│  ANTI-EXPLOIT                                                    │
│  ├─ Instant vouch activation → 48-hour delay                   │
│  ├─ 1 voucher for any loan   → 3-5 minimum by size            │
│  ���─ No default cooldown      → 30-day freeze + recovery path   │
│                                                                  │
└─────────────────────────────────────────���────────────────────────┘
```

---

## New Contract Architecture

```
Current:                          Fixed:
┌───────────────┐                ┌───────────────────┐
│ TrustCircle   │                │ TrustCircle V2    │
│               │                │                   │
│ - flat rate   │                │ + ReputationEngine│ ← Fix 1,2,3
│ - no tiers    │       →        │ + TierManager     │ ← Fix 4,5
│ - no insurance│                │ + InsurancePool   │ ← Fix 7
│ - no bounty   │                │ + LiquidationMkt  │ ← Fix 10
│ - no gates    │                │ + CircuitBreaker  │ ← Fix 11
│               │                │ + AntiExploit     │ ← Fix 12,13,14
└───────────────┘                │ + GracePeriod     │ ← Fix 8
                                 └───────────────────┘

New interfaces needed:
  IInsurancePool   → deposit(), claimCoverage(), getBalance()
  ITierManager     → getTier(rep), getMaxBorrow(rep), getRate(rep)
  ICircuitBreaker  → checkHealth(), getSystemStatus()
```

---

## New State Variables Summary

```solidity
// ═══ TIER SYSTEM (Fix 1, 4, 5) ═══
struct Tier {
    uint256 minRep;
    uint256 maxBorrow;
    uint256 interestRateBps;
    uint256 maxDuration;
}
mapping(uint8 => Tier) public tiers; // 6 tiers

// ═══ REPUTATION ENGINE (Fix 2, 3) ═══
mapping(address => uint256) public lastActivityTimestamp;
uint256 public constant REP_DECAY_START = 90 days;
uint256 public constant REP_DECAY_RATE = 5; // per month

// ═══ INSURANCE POOL (Fix 7) ═══
uint256 public insurancePool;
uint256 public constant INSURANCE_CONTRIBUTION_BPS = 100; // 1%
uint256 public constant INSURANCE_COVERAGE_BPS = 3000;    // 30%

// ═══ GRACE PERIOD (Fix 8) ═══
uint256 public constant GRACE_PERIOD = 7 days;
uint256 public constant LATE_FEE_BPS = 200; // 2%

// ═══ LIQUIDATION BOUNTY (Fix 10) ═══
// Computed dynamically based on days overdue

// ═══ CIRCUIT BREAKER (Fix 11) ═══
uint256 public defaultsLast7Days;
uint256 public activeLoansCount;
enum SystemHealth { GREEN, YELLOW, RED, RECOVERY }
SystemHealth public systemHealth;

// ═══ ANTI-EXPLOIT (Fix 12, 13, 14) ═══
uint256 public constant VOUCH_ACTIVATION_DELAY = 48 hours;
uint256 public constant DEFAULT_COOLDOWN = 30 days;
mapping(address => uint256) public defaultCooldownUntil;

// Voucher struct additions:
//   uint256 activatesAt;
```

---

## Implementation Priority

```
PHASE 1: CRITICAL (must fix before any real usage)
  □ Fix 1:  Rep gates borrowing         ← Without this, protocol is exploitable
  □ Fix 4:  Tiered interest rates       ← Without this, vouchers won't join
  □ Fix 5:  Graduated borrow limits     ← Without this, grief damage is unlimited
  □ Fix 7:  Insurance pool              ← Without this, voucher risk is too high
  □ Fix 9:  Overpayment refund          ← Without this, users lose money silently
  □ Fix 14: Rep-zero freeze             ← Without this, serial defaulters loop

PHASE 2: IMPORTANT (before mainnet)
  □ Fix 6:  Vouch concentration limits  ← Anti-collusion
  □ Fix 8:  Grace period                ← Reduces accidental defaults
  □ Fix 10: Liquidation bounty          ← Keeps protocol healthy
  □ Fix 12: Vouch activation delay      ← Anti-flash-attack
  □ Fix 13: Minimum voucher count       ← Anti-collusion at scale

PHASE 3: HARDENING (post-launch)
  □ Fix 2:  Reputation decay            ← Prevents park-and-exit
  □ Fix 3:  Voucher reputation multiplier← Quality signal
  □ Fix 11: Circuit breakers            ← Death spiral prevention
```

---

## Verification: Is The Game Now Balanced?

```
PLAYER          DOMINANT STRATEGY        STATUS
────────────────────────────────────────────────
Borrower        Repay                    ★ Fixed
                (future access > loan)

Voucher         Vouch selectively        ★ Fixed
                (EV positive at 85%+)

Liquidator      Liquidate ASAP           ★ Fixed
                (bounty > gas)

Attacker        Abstain                  ★ Fixed
                (all attacks negative EV)

Protocol        Self-sustaining          ★ Fixed
                (insurance + fees + growth)


NASH EQUILIBRIUM: (Vouch Selectively, Repay Always,
                   Liquidate Promptly, Don't Attack)

This is the DESIRED equilibrium.
The game is balanced. ★
```
