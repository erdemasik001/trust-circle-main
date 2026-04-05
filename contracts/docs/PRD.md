# Trust Circle — Product Requirements Document (PRD)

> **Version:** 1.0
> **Date:** April 2026
> **Status:** MVP / Hackathon Submission

---

## 1. Product Vision

**Enable anyone with a phone to access credit through the trust of people who know them — no banks, no collateral, no documents.**

Trust Circle is a decentralized social lending protocol where verified humans vouch for each other with real money, creating an enforceable, transparent, and reputation-building credit system on World Chain.

---

## 2. User Personas

### Persona 1: Fatma (Borrower)
- **Age:** 28, Istanbul
- **Occupation:** Freelance graphic designer
- **Problem:** Needs 500 USDC to buy a new tablet for work. Has no credit history, no formal employment contract, no collateral. Banks won't talk to her.
- **Behavior:** Active in a WhatsApp community of freelancers. 3 friends willing to back her.
- **Goal:** Borrow quickly, repay in 30 days, build a credit reputation for larger future loans.

### Persona 2: Mehmet (Voucher / Kefil)
- **Age:** 35, Berlin (Turkish diaspora)
- **Occupation:** Software engineer
- **Problem:** Has savings sitting idle. Wants to help friends/family back home access credit, but sending money directly feels one-sided.
- **Behavior:** Trusts Fatma because they've worked together. Willing to risk 200 USDC if he earns yield. Checks her rep score (Rep 300 = "Building" tier) before committing.
- **Goal:** Earn up to 12% yield while helping someone he trusts. Max loss is 70% (insurance covers 30%). Capped at 5 active vouch positions to manage exposure.

### Persona 3: Ayse (Power User / Circle Builder)
- **Age:** 42, Ankara
- **Occupation:** Community organizer / Women's cooperative leader
- **Problem:** Her cooperative members need small loans (50-500 USDC) regularly. Current options are loan sharks at 30%+ interest.
- **Behavior:** Knows everyone in her community. Can assess risk better than any algorithm.
- **Goal:** Build a trust circle where cooperative members vouch for each other, creating a self-sustaining micro-lending pool.

### Persona 4: Bot / Liquidator
- **Type:** Automated agent or protocol participant
- **Problem:** Defaulted loans need to be settled to keep the protocol healthy.
- **Behavior:** Monitors loan due dates. Waits for 7-day grace period to pass. Triggers liquidation to earn bounty.
- **Goal:** Earn 1-5% liquidation bounty (time-decay: higher bounty the longer a default goes unsettled). Dominant strategy: liquidate ASAP at 1% because competition is fierce.

---

## 3. User Stories & Requirements

### Epic 1: Identity & Onboarding

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-1.1 | As a new user, I want to verify my identity with World ID so I can join Trust Circle | P0 | World ID proof accepted, user registered on-chain, one-time only |
| US-1.2 | As a registered user, I want to claim a human-readable name (e.g., fatma.trustcircle.eth) | P0 | Subname claimed, 3-32 chars, unique, resolvable to address |
| US-1.3 | As a user, I want to link my existing ENS name to my Trust Circle profile | P2 | Mainnet ENS stored in profile (display only, no on-chain verification in MVP) |
| US-1.4 | As a user, I want to see my dashboard showing reputation, vouches, and active loans | P0 | Single view with all profile data |

### Epic 2: Vouching (Kefalet)

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-2.1 | As a voucher, I want to vouch for someone by setting a USDC limit | P0 | USDC approved + vouch created on-chain |
| US-2.2 | As a voucher, I want to increase or decrease my vouch limit | P1 | Vouch amount updated, borrower's total limit recalculated |
| US-2.3 | As a voucher, I want to revoke my vouch if it's not being used | P1 | Vouch deactivated if usedAmount == 0 |
| US-2.4 | As a voucher, I want to see all people I've vouched for and their loan status | P0 | List of borrowers with vouch amounts and active loan info |
| US-2.5 | As a voucher, I want to search for users by their .trustcircle.eth name | P0 | ENS forward resolution returns address |

### Epic 3: Borrowing

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-3.1 | As a borrower, I want to see my available credit limit (sum of all vouches) | P0 | Accurate limit displayed, updated in real-time |
| US-3.2 | As a borrower, I want to borrow up to my tier limit (min of vouch limit and rep tier max) | P0 | Amount capped by both vouch availability and reputation tier |
| US-3.3 | As a borrower, I want to see my loan terms (amount, tier-based interest, due date) before confirming | P0 | Preview showing: principal, tier interest rate (2-15%), total due, tier-based duration, required voucher count |
| US-3.4 | As a borrower, I want to see a countdown to my due date | P1 | Days/hours remaining displayed on dashboard |
| US-3.5 | As a borrower, I want to see my reputation tier and what I need to unlock the next level | P0 | Current tier + progress bar to next tier |

### Epic 4: Repayment

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-4.1 | As a borrower, I want to repay my loan (partial or full) | P0 | USDC transferred, loan balance updated |
| US-4.2 | As a borrower, I want to see my remaining balance after partial payment | P0 | Remaining = totalDue - amountRepaid |
| US-4.3 | As a voucher, I want to receive my principal + yield when the loan is fully repaid | P0 | Auto-distribution on full repayment |

### Epic 5: Default & Liquidation

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-5.1 | As any registered user, I want to liquidate an overdue loan (after grace period) and earn a bounty | P0 | Loan marked defaulted after 7-day grace period. Liquidator receives 1-5% bounty from insurance pool. Vouchers slashed at 70% (insurance covers 30%). |
| US-5.2 | As a voucher, I want to know immediately if my vouch has been slashed | P0 | Event emitted + Telegram notification sent |
| US-5.3 | As a borrower, I want to understand the consequences of default before borrowing | P0 | Clear warning: "Your vouchers lose 70% of stake. Your rep drops by 50. Below Rep 100 = account frozen for 30 days. You lose all future credit access." |
| US-5.4 | As a borrower who missed the due date, I want a 7-day grace period to repay with a late fee | P0 | Grace period active, 2% late fee added, minor rep penalty (-10), no liquidation during grace |
| US-5.5 | As a defaulted borrower, I want to understand how to recover my account | P1 | Recovery path shown: 30-day cooldown → vouch for others who repay → rebuild rep to 100 |

### Epic 6: Reputation & Tiers

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-6.1 | As a user, I want to see my reputation score, current tier, and what it unlocks | P0 | Score + tier badge + table: Frozen/Newcomer/Rising/Building/Trusted/Established/Leader with limits, rates, durations |
| US-6.2 | As a voucher, I want to see a borrower's reputation tier, loan history, and default count before vouching | P0 | Full profile: rep score, tier, loans repaid, defaults, time since registration, current voucher count |
| US-6.3 | As a borrower, I want my reputation to unlock better terms (higher limits, lower rates, longer duration) | P0 | Tier system enforced on-chain: Rep 100→$100/15%/14d, Rep 300→$2K/8%/30d, Rep 700→$50K/3%/90d |
| US-6.4 | As a user, I want my reputation to reflect activity (decay if inactive for 90+ days) | P1 | -5 rep/month after 90 days inactivity. Stops on any transaction. |
| US-6.5 | As a voucher, I want my rep to amplify my vouch power (high-rep vouchers count for more) | P1 | Voucher multiplier: Rep 100=0.5x, Rep 500=1.0x, Rep 900=1.5x |

### Epic 7: Insurance & Protection

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-7.1 | As a voucher, I want to know my maximum loss is 70% (not 100%) thanks to insurance | P0 | Insurance pool funded by 1% of every loan. Covers 30% of voucher losses on default. |
| US-7.2 | As a user, I want to see the protocol health status (Green/Yellow/Red) | P1 | Circuit breaker dashboard: default rate < 10% = Green, >= 10% = Yellow (limits halved, rates +50%), >= 20% = Red (new loans blocked) |
| US-7.3 | As a user, I want to see when the system enters Recovery mode | P2 | When default rate drops to <= 5%, system enters 14-day Recovery period before returning to Green |

### Epic 8: Anti-Exploit

| ID | User Story | Priority | Acceptance Criteria |
|---|---|---|---|
| US-8.1 | As a voucher, I want my vouch to activate after 48 hours (not instantly) | P0 | Vouch is PENDING for 48h. Can cancel for free during this window. |
| US-8.2 | As a borrower, I need minimum 3 vouchers for loans > $200 (5 for > $2K) | P0 | On-chain enforcement. Prevents self-collusion. |
| US-8.3 | As a voucher, no single vouch can exceed 40% of a borrower's total limit | P0 | Concentration cap enforced on-chain. Forces diverse backing. |
| US-8.4 | As a voucher, I can have at most 5 active vouch positions | P0 | Prevents cascade risk from overexposure. |

---

## 4. Product Flow

### 4.1 Happy Path: First Loan (Newcomer Tier)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  ONBOARD    │────>│  BUILD       │────>│  BORROW      │
│             │     │  CIRCLE      │     │              │
│ World ID    │     │ Share link   │     │ Max $100     │
│ Claim name  │     │ 3+ friends   │     │ (Newcomer)   │
│ Rep = 100   │     │ vouch (48h   │     │ 15% interest │
│ Tier:       │     │ activation)  │     │ 14-day term  │
│ "Newcomer"  │     │ USDC approved│     │ Review+Sign  │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  LEVEL UP   │<────│  REPAY       │<────│  USE FUNDS   │
│             │     │              │     │              │
│ Rep +10→110 │     │ Approve USDC │     │ 14 days to   │
│ Next: $500  │     │ Pay $115     │     │ use & repay  │
│ at 12%      │     │ Vouchers get │     │              │
│ "Rising"    │     │ principal+   │     │ (1% goes to  │
│ at Rep 200  │     │ 80% interest │     │  insurance)  │
└─────────────┘     └──────────────┘     └──────────────┘
```

### 4.2 Unhappy Path: Default

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  DUE DATE    │────>│  GRACE PERIOD│────>│  LIQUIDATION │
│  PASSES      │     │  (7 DAYS)    │     │              │
│              │     │              │     │ Anyone calls │
│ Borrower     │     │ Can still    │     │ liquidate()  │
│ notified     │     │ repay (+2%   │     │ Earns 1-5%   │
│              │     │ late fee)    │     │ bounty       │
│              │     │ Rep -10      │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  CONSEQUENCES│
                                         │              │
                                         │ Vouchers lose│
                                         │ 70% (insured │
                                         │ at 30%)      │
                                         │              │
                                         │ Borrower:    │
                                         │ Rep -50      │
                                         │ If Rep < 100 │
                                         │ → FROZEN     │
                                         │ 30-day       │
                                         │ cooldown     │
                                         │              │
                                         │ Recovery:    │
                                         │ Vouch others │
                                         │ → rebuild rep│
                                         └──────────────┘
```

---

## 5. Information Architecture

### 5.1 App Screens (MiniKit / Web)

```
Trust Circle App
├── Onboarding
│   ├── Welcome & Explainer
│   ├── World ID Verification
│   ├── Claim .trustcircle.eth Name
│   └── Tutorial / First Steps
│
├── Dashboard (Home)
│   ├── Profile Card (name, rep score, avatar)
│   ├── Credit Limit Bar (available / total)
│   ├── Active Loan Card (if exists)
│   │   ├── Amount remaining
│   │   ├── Due date countdown
│   │   └── [Repay] button
│   ├── My Vouchers (people backing me)
│   └── Quick Actions
│       ├── [Borrow]
│       ├── [Vouch for Someone]
│       └── [Repay]
│
├── Borrow Flow
│   ├── Amount Selector (slider up to limit)
│   ├── Terms Preview (interest, due date, total)
│   ├── Voucher Breakdown (who's backing this)
│   └── Confirm & Sign
│
├── Vouch Flow
│   ├── Search by Name (ENS resolution)
│   ├── Borrower Profile Card
│   │   ├── Reputation score
│   │   ├── Loan history (repaid / defaulted)
│   │   └── Existing vouches
│   ├── Amount Input
│   ├── USDC Approval
│   └── Confirm Vouch
│
├── My Circle
│   ├── People I Vouch For (with loan status)
│   ├── People Who Vouch For Me
│   └── Invite Link / QR Code
│
├── Loan History
│   ├── Past Loans (repaid / defaulted)
│   ├── Yield Earned (as voucher)
│   └── Slashing Events
│
└── Settings
    ├── ENS Profile
    ├── Link Mainnet ENS
    └── Notifications
```

---

## 6. Data Model (Conceptual)

### Reputation Tier
```
{
  tierId: 2,
  name: "Rising",
  minRep: 200,
  maxBorrow: 500 USDC,
  interestRateBps: 1200,       // 12%
  maxDuration: 21 days,
  minVouchers: 3               // for loans > $200
}
```

### User Profile
```
{
  address: "0x...",
  ensName: "fatma.trustcircle.eth",
  mainnetENS: "fatma.eth" (optional),
  reputationScore: 310,
  reputationTier: "Building",  // determines limits, rates, duration
  totalVouchesReceived: 2500 USDC,
  totalBorrowed: 1500 USDC,
  registeredAt: timestamp,
  lastActivityTimestamp: timestamp,  // for rep decay calculation
  activeLoanId: 7,
  defaultCooldownUntil: 0,     // 0 = not in cooldown
  activeVouchCount: 3          // max 5
}
```

### Vouch
```
{
  voucher: "mehmet.trustcircle.eth",
  borrower: "fatma.trustcircle.eth",
  amount: 500 USDC,
  usedAmount: 300 USDC,
  isActive: true,
  activatesAt: timestamp,      // 48h after creation
  createdAt: timestamp,
  voucherMultiplier: 1.0       // based on voucher's rep (0.5x-1.5x)
}
```

### Loan
```
{
  id: 7,
  borrower: "fatma.trustcircle.eth",
  principal: 1000 USDC,
  interestRate: 8%,            // tier-based (not global)
  totalDue: 1080 USDC,
  amountRepaid: 0,
  dueDate: 30 days from borrow,
  gracePeriodEnd: dueDate + 7 days,
  status: Active,
  vouchers: [mehmet, ayse, ali],
  voucherAmounts: [300, 400, 300],
  insuranceContribution: 10 USDC  // 1% of principal
}
```

### Insurance Pool
```
{
  balance: 5000 USDC,
  totalContributions: 8000 USDC,
  totalPayouts: 3000 USDC,
  coverageRateBps: 3000        // 30% of losses
}
```

### System Health
```
{
  status: "GREEN",             // GREEN / YELLOW / RED / RECOVERY
  activeLoansCount: 45,
  defaultsLast7Days: 2,
  defaultRate: 4.4%,
  insurancePoolBalance: 5000 USDC
}
```

---

## 7. Success Metrics

### Hackathon Demo Metrics
| Metric | Target |
|---|---|
| End-to-end demo flow | Registration → Vouch → Borrow → Repay in < 3 minutes |
| Contracts deployed | All 5 contracts on World Chain Sepolia |
| World ID integration | Working MiniKit proof verification |
| ENS resolution | Forward + reverse resolution working |
| Test coverage | 80%+ on core contract |

### Post-Hackathon Growth Metrics (if continued)
| Metric | 3-Month Target | 12-Month Target |
|---|---|---|
| Registered users | 500 | 10,000 |
| Total vouched USDC | $50,000 | $2,000,000 |
| Loans originated | 100 | 5,000 |
| Repayment rate | >90% | >95% |
| Average reputation score | 150 | 300 |
| Protocol fee revenue | $250 | $20,000 |

---

## 8. Non-Functional Requirements

### Performance
- Transaction confirmation: < 5 seconds on World Chain
- Frontend load time: < 2 seconds
- ENS resolution: < 1 second

### Security
- World ID Sybil resistance (one human = one account)
- Reentrancy protection on all state-changing functions
- Pausable emergency mechanism
- No admin key can steal user funds

### Scalability
- Support 10,000+ users without gas cost explosion
- Vouch array iteration bounded (future: max vouch count per borrower)

### Compliance
- No KYC data stored on-chain or off-chain
- World ID proof is zero-knowledge — protocol never learns user's real identity
- USDC (regulated stablecoin) as base asset

---

## 9. Assumptions & Constraints

### Assumptions
1. World ID adoption continues growing in target markets
2. Users have access to USDC (via World App on-ramp or P2P)
3. Social pressure + financial consequences (frozen account, lost future access) are sufficient enforcement for small-to-medium loans
4. Tiered interest rates (2-15%) are attractive for both borrowers and vouchers at each risk level
5. Insurance pool funded at 1% per loan reaches sufficient balance within 3 months to cover expected defaults
6. Voucher break-even confidence of ~85% is achievable through personal knowledge of borrowers

### Constraints
1. **Single active loan per user** — simplifies MVP, limits risk
2. **Tier-based duration** — 14d (newcomer) to 180d (leader), not negotiable per-loan
3. **Tier-based interest** — set by reputation, not negotiated per-loan
4. **No partial yield distribution** — vouchers only earn on full repayment
5. **Mock ARC** — yield/staking engine is simulated, not production-grade
6. **Testnet only** — no real funds at risk during hackathon
7. **Insurance pool starts at 0** — needs loan volume to build up

### Nash Equilibrium Guarantees
These properties are mathematically proven in `GAME_THEORY.md`:
1. **Repay is dominant for borrowers** — future access value > one-time default gain at every tier
2. **Selective vouching is dominant for vouchers** — positive EV at 85%+ confidence (achievable with personal knowledge)
3. **Liquidation is dominant for liquidators** — bounty > gas cost always
4. **All known attack vectors are negative EV** — collusion, grief, flash loan all unprofitable

---

## 10. Out of Scope (v1)

- Multi-loan support
- DAO governance
- Cross-chain lending
- Fiat on/off ramp
- Credit score export / interoperability with other protocols
- Loan refinancing or extension
- Community arbitration (v3)
- Cross-circle endorsements (v2)
- Achievement/badge system (v2)
