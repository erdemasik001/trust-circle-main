# Trust Circle — Gap Analysis & Closure Plan

> This document identifies **concept-level gaps** and tracks their closure status.
> Fixes reference `SYSTEM_FIX.md` (14 Nash-balanced fixes) and `GAME_THEORY.md` (equilibrium proofs).

---

## Gap Map Overview

```
                    TRUST CIRCLE GAP MAP (UPDATED)
    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │  ECONOMIC MODEL          PRODUCT DESIGN             │
    │  ├─ [CLOSED] Voucher     ├─ No frontend (TODO)      │
    │  │  incentive (Fix 4,7)  ├─ No notifications (TODO) │
    │  ├─ [CLOSED] Liquidation ├─ No social features (v2) │
    │  │  reward (Fix 10)      └─ No onboarding flow(TODO)│
    │  ├─ [CLOSED] Reputation                             │
    │  │  utility (Fix 1,2,3)                             │
    │  └─ [CLOSED] Risk                                   │
    │     pricing (Fix 4,5)                               │
    │                                                     │
    │  TRUST & SAFETY          GROWTH & NETWORK           │
    │  ├─ [CLOSED] Collusion   ├─ Cold start (planned)    │
    │  │  (Fix 12,13)          ├─ No viral loop (v2)      │
    │  ├─ [CLOSED] Grief       ├─ No circle discovery(v2) │
    │  │  (Fix 5,14)           └─ Cross-circle (v3)       │
    │  ├─ [CLOSED] Cascades                               │
    │  │  (Fix 6,11)                                      │
    │  └─ [CLOSED] Disputes                               │
    │     (Fix 8)                                         │
    │                                                     │
    │  SUSTAINABILITY          IDENTITY                   │
    │  ├─ [CLOSED] Revenue     ├─ ENS verification (v2)   │
    │  │  (tiered rates)       ├─ No profile richness(v2) │
    │  ├─ [CLOSED] Insurance   └─ Off-chain rep (v3)      │
    │  │  pool (Fix 7)                                    │
    │  └─ No upgrade path(v2)                             │
    │                                                     │
    └─────────────────────────────────────────────────────┘

LEGEND: [CLOSED] = addressed by Nash-balanced fix in SYSTEM_FIX.md
        (TODO)   = needs implementation (frontend/infra)
        (v2/v3)  = planned for future versions
```

---

## Gap 1: Voucher Risk/Reward Imbalance

### The Problem
A voucher earns ~4% yield (80% of 5% interest) but risks 100% of their stake. That's a **25:1 downside ratio**. No rational actor takes this bet at scale.

### Why It Matters
Without vouchers, there are no loans. This is existential.

### Closure Plan

**A. Tiered Yield Based on Risk**
```
Risk Tier       Borrower Rep    Interest Rate    Voucher Yield
──────────────────────────────────────────────────────────────
Low Risk        800-1000        3%               2.4%
Medium Risk     400-799         7%               5.6%
High Risk       100-399         12%              9.6%
New User        100 (default)   15%              12%
```
Higher risk = higher reward. Vouchers self-select into risk they're comfortable with.

**B. Insurance Pool (Partial Loss Protection)**
```
Every loan contributes 1% of principal to a shared insurance pool.
On default, the pool covers up to 30% of voucher losses.

Voucher exposure goes from 100% → 70% worst case.
Risk/reward ratio improves from 25:1 → 7:1.
```

**C. Graduated Vouch Limits**
```
First vouch to a new user:     max 50 USDC
After 1 successful repayment:  max 200 USDC
After 3 successful repayments: max 1,000 USDC
After 10 repayments:           max 10,000 USDC
```
Vouchers never have to go all-in on an unproven borrower.

---

## Gap 2: Reputation Has No Utility

### The Problem
Reputation score (0-1000) exists but does nothing. A user with score 100 and score 900 have identical borrowing terms. There's no incentive to maintain good standing.

### Closure Plan

**Reputation unlocks real benefits:**

| Score Range | Tier Name | Unlocks |
|---|---|---|
| 0-99 | Frozen | Cannot borrow. 30-day cooldown after default. Rebuild by vouching others. |
| 100-199 | Newcomer | Max borrow $100. 15% interest. 14-day term. |
| 200-299 | Rising | Max borrow $500. 12% interest. 21-day term. |
| 300-499 | Building | Max borrow $2,000. 8% interest. 30-day term. |
| 500-699 | Trusted | Max borrow $10,000. 5% interest. 60-day term. |
| 700-899 | Established | Max borrow $50,000. 3% interest. 90-day term. |
| 900-1000 | Leader | Max borrow $100,000. 2% interest. 180-day term. Can create sub-circles. |

**Reputation also decays over time:**
- Inactive for 90 days → -5 rep/month
- This prevents "park and forget" behavior
- Keeps the network active

---

## Gap 3: No Liquidation Incentive

### The Problem
Anyone can call `liquidateDefaultedLoan()` but gets nothing. Protocol depends on altruism or centralized bots to settle defaults.

### Closure Plan

**Liquidation Bounty Model (Time-Decay):**
```
Liquidator calls liquidate() after due date + 7-day grace period
→ Bounty scales with time overdue:
  Day 1-3 past grace:   1% of outstanding debt
  Day 4-7 past grace:   2%
  Day 8-14 past grace:  3%
  Day 15+ past grace:   5%
→ Bounty comes from the insurance pool (not vouchers)
→ Voucher loss is max 70% (insurance covers 30%)

Example:
  Loan: 1000 USDC, fully defaulted, liquidated on day 1 past grace
  Liquidator bounty: 10 USDC (from insurance pool)
  Insurance payout to vouchers: 300 USDC (30% coverage)
  Voucher net loss: 700 USDC (not 1000)
```

**Why this works (Nash-proven):**
- Liquidate is DOMINANT strategy: bounty ($10+) > gas ($0.01) always
- Rising bounty guarantees settlement even if early liquidators miss it
- Competition between liquidators ensures fast settlement
- Vouchers lose 70% max, not 100% — dramatically improves risk/reward ratio

---

## Gap 4: Cold Start Problem

### The Problem
Trust Circle is a two-sided market. Borrowers need vouchers. Vouchers need borrowers. At launch, there are zero of both.

### Closure Plan

**Phase 1: Seed Circles (Week 1-4)**
```
Trust Circle team creates 3-5 "seed circles" with:
- 10 team members + friends as initial vouchers
- $5,000 USDC seeded into each circle
- Real loans issued to real borrowers (team/friends network)
- All on-chain, all public, demonstrating the system works
```

**Phase 2: Community Circles (Month 2-3)**
```
Launch "Circle Builder" program:
- Identify community leaders (like Ayse persona)
- Each leader recruits 10-20 members from their network
- Protocol matches up to $2,000 USDC per circle (liquidity mining)
- Leaders earn bonus reputation for circle performance
```

**Phase 3: Organic Growth (Month 4+)**
```
Remove subsidies. By now:
- Existing users invite friends (referral = +10 rep)
- Successful circles are visible as examples
- Word of mouth in target communities
```

**The Invite Flow:**
```
Mehmet vouches for Fatma → Fatma gets a loan → Fatma repays
→ Fatma's rep goes up → Fatma shares her "trust circle link"
→ 3 friends see she has 200 rep → they trust the system → they join
→ Fatma vouches for them → cycle repeats
```

---

## Gap 5: No Social Layer / Viral Loop

### The Problem
The protocol is pure finance. No social features = no engagement = no virality. Users come for one transaction and leave.

### Closure Plan

**A. Trust Circle Groups**
```
Users can create named circles:
  "Istanbul Freelancers"
  "Berlin Turkish Community"
  "Ankara Women's Cooperative"

Each circle has:
  - A shared reputation score (avg of members)
  - A leaderboard (top vouchers, top repayers)
  - An invite link / QR code
  - Circle stats (total lent, repayment rate)
```

**B. Social Proof Signals**
```
On every borrower's profile, display:
  - "Backed by 5 people"
  - "mehmet.trustcircle.eth vouches for this person"
  - "3/3 loans repaid on time"
  - "Member of Istanbul Freelancers (97% repayment rate)"
```

**C. Achievement System**
```
Badges earned on-chain (soulbound):
  - "First Loan Repaid"        → Borrower repays first loan
  - "Trusted 5"                → Vouched for 5 people who all repaid
  - "Circle Founder"           → Created a circle with 10+ members
  - "Perfect Record"           → 10 loans, 0 defaults
  - "Community Pillar"         → Rep score 900+
```

**D. Referral Mechanism**
```
User A refers User B:
  - User B registers → A gets +5 rep
  - User B repays first loan → A gets +10 rep
  - User B defaults → A gets -5 rep (skin in the game for referrals too)
```

---

## Gap 6: Collusion & Grief Attack Vectors

### The Problem
**Collusion:** Alice creates 2 World ID accounts (buys a spare orb verification). Account A vouches for Account B. Account B borrows and never repays. Alice walks away with the borrowed amount minus her own vouch (net zero or small profit if she has other vouchers).

**Grief:** Malicious user gets vouched, borrows max, intentionally defaults to damage vouchers financially.

### Closure Plan

**Anti-Collusion Measures:**
```
1. Social Graph Analysis (off-chain)
   - Flag if vouch graph is suspiciously isolated
     (only 2 users vouching for each other = red flag)
   - Require minimum 3 unique vouchers for loans > 500 USDC
   - Vouches activate after 48-hour delay (anti-flash-vouch)

2. Vouch Diversity Requirement
   - No single voucher can represent > 40% of a borrower's limit
   - Forces borrowers to build real social networks, not fake pairs

3. Cooling Period
   - New vouches become effective after 48 hours
   - Prevents flash-vouch-borrow-default in one session
```

**Anti-Grief Measures:**
```
1. Graduated Borrowing (see Gap 2)
   - New users can only borrow $100 max (Newcomer tier)
   - Limits damage from intentional default

2. Voucher Alerts
   - When someone you vouch for borrows, you get notified
   - You can revoke vouch BEFORE borrow executes (48h window)

3. Reputation Floor
   - Users with rep 0 cannot borrow at all
   - One default doesn't end your account, but two might
```

---

## Gap 7: No Dispute Resolution

### The Problem
Real life has edge cases: medical emergency prevents repayment, voucher revokes unfairly, borrower claims they repaid but tx failed. No mechanism to handle disputes.

### Closure Plan

**Grace Period System:**
```
Loan Due Date → 7-day Grace Period → Liquidation Eligible

During grace period:
  - Borrower can still repay (with 2% late fee)
  - No slashing occurs
  - Vouchers are notified of late status
  - Reputation takes -10 (minor penalty for being late)
```

**Extension Requests (v2):**
```
Borrower can request 14-day extension:
  - Requires approval from >50% of vouchers (by staked amount)
  - Extension adds 3% fee to total due
  - Only 1 extension allowed per loan
  - Vouchers vote on-chain (simple majority)
```

**Community Arbitration (v3):**
```
For complex disputes:
  - 3 random Circle Leaders (rep 900+) selected as arbiters
  - Both parties present their case (on-chain messages)
  - Arbiters vote: uphold default / partial repayment / full forgiveness
  - Arbiters earn small fee for participation
```

---

## Gap 8: Default Cascade Risk

### The Problem
If Mehmet vouches for 5 people and 3 default simultaneously, Mehmet loses most of his capital. Mehmet then can't honor his own vouch obligations for the remaining 2 borrowers, causing a cascade.

### Closure Plan

**Exposure Limits:**
```
Per-Voucher Rules:
  - Max 5 active vouches per user
  - Max 30% of a voucher's total staked amount to a single borrower
  - "Portfolio view" shows total exposure and risk distribution

System-Level Rules:
  - If a voucher has >50% of their vouches in active loans, block new vouches
  - Circuit breaker: if protocol-wide default rate > 20% in 7 days, pause new loans
```

**Stress Indicators:**
```
Dashboard shows "Trust Circle Health":
  - Green: <10% default rate, normal operation
  - Yellow: 10-20% default rate, limits halved, rates +50%
  - Red: >=20% default rate, new loans blocked
  - Recovery: rate drops to <=5%, 14-day normalization period

Per-user "Risk Score" for vouchers:
  - How many active loans are you exposed to?
  - What's the average reputation of your borrowers?
  - How diversified is your vouch portfolio?
```

---

## Gap 9: Protocol Sustainability

### The Problem
Protocol earns 20% of interest (1% on a 5% loan). At small scale, this doesn't cover operational costs. No path to self-sustainability.

### Closure Plan

**Revenue Streams:**
```
1. Protocol Fee: 20% of interest on every loan (existing)
   - At $2M loan volume: $2M × 5% interest × 20% fee = $20,000/year

2. Insurance Pool Interest: Pool funds earn yield in external DeFi
   - Pool of $50,000 at 5% = $2,500/year passive

3. Premium Circles (v2): Verified circles with enhanced features
   - Analytics dashboard, custom terms, priority support
   - $50/month per circle or 0.5% of circle volume

4. Data/Reputation API (v3): Other protocols pay to query reputation
   - Credit score as a service for DeFi protocols
   - Privacy-preserving (ZK proofs of reputation range, not exact score)
```

**Cost Structure:**
```
Phase 1 (Hackathon): $0 — testnet, team time only
Phase 2 (Beta):      ~$500/month — RPC, hosting, monitoring
Phase 3 (Growth):    ~$5,000/month — team, infrastructure, liquidity mining
Break-even:          ~$2M cumulative loan volume
```

---

## Gap 10: ENS Identity is Shallow

### The Problem
Users claim a `.trustcircle.eth` name but it's just a string. No profile richness, no cross-platform portability, no verification of mainnet ENS.

### Closure Plan

**Rich Profiles:**
```
Profile data stored as ENS text records (on L2):

  avatar       → IPFS hash of profile picture
  description  → "Freelance designer from Istanbul"
  url          → Personal website
  twitter      → @handle (display only)

  trustcircle.reputation  → 450
  trustcircle.loans       → 7
  trustcircle.defaults    → 0
  trustcircle.circles     → ["Istanbul Freelancers", "Design Community"]
```

**Verified Mainnet ENS (v2):**
```
Instead of accepting any string:
  1. User signs a message with their mainnet wallet
  2. Frontend verifies ENS name resolves to that wallet
  3. Signature stored alongside the ENS name
  4. Profile shows "Verified: fatma.eth ✓"

Not on-chain verification (too expensive), but cryptographically valid.
```

**Cross-Platform Identity:**
```
.trustcircle.eth names become portable:
  - Other World Chain dApps can resolve Trust Circle profiles
  - Reputation score readable by any protocol via public view functions
  - Future: CCIP-Read for mainnet resolution
```

---

## Gap 11: No Off-Chain Communication Layer

### The Problem
All interactions are on-chain transactions. No way to:
- Remind borrowers about upcoming due dates
- Notify vouchers when their borrower takes a loan
- Alert users about reputation changes
- Send vouch requests

### Closure Plan

**Push Notification System:**
```
Integration options (in priority order):

1. World App Notifications (via MiniKit 2.0)
   - Native push via World App
   - Best UX for target users

2. XMTP (Decentralized Messaging)
   - Wallet-to-wallet messaging
   - "fatma.trustcircle.eth sent you a vouch request"

3. Webhook → Telegram Bot (simplest MVP)
   - Users connect Telegram handle
   - Bot sends: "Your loan is due in 3 days"

4. Email (v2)
   - Optional email registration for traditional users
```

**Notification Events:**
```
BORROWER:
  - "X just vouched for you! Available limit: Y USDC"
  - "Your loan is due in 7 days"
  - "Your loan is due in 1 day"
  - "Your loan is OVERDUE. Repay now to avoid default."

VOUCHER:
  - "fatma.trustcircle.eth just borrowed 500 USDC (backed by your vouch)"
  - "Great news: fatma repaid her loan. You earned 20 USDC yield!"
  - "WARNING: fatma's loan is overdue. Your 200 USDC vouch is at risk."

GENERAL:
  - "Your reputation increased to 310!"
  - "New vouch request from mehmet.trustcircle.eth"
```

---

## Gap 12: No Cross-Circle Trust / Portability

### The Problem
Reputation earned in "Istanbul Freelancers" circle means nothing in "Berlin Tech Community" circle. Trust is siloed.

### Closure Plan

**Universal Reputation (Already Exists On-Chain)**
```
Reputation score is per-address, not per-circle.
Any user can see any other user's:
  - Total loans taken
  - Total loans repaid
  - Default count
  - Time since registration

This is ALREADY cross-circle portable.
What's missing is the DISCOVERY layer.
```

**Circle Endorsements (v2):**
```
Circles can collectively endorse users from other circles:

  "Istanbul Freelancers" endorses "fatma.trustcircle.eth"
  → fatma's profile shows: "Endorsed by Istanbul Freelancers (97% repay rate)"
  → Berlin Tech Community sees this endorsement
  → Members of Berlin more likely to vouch for fatma

Circle endorsement = "our circle trusts this person from another circle"
```

**Trust Path Discovery (v3):**
```
Alice (Berlin) doesn't know Fatma (Istanbul).
But Alice knows Mehmet, and Mehmet vouches for Fatma.

Display: "Fatma is 1 hop away from you via Mehmet"

This visualizes the social graph:
  Alice → Mehmet → Fatma (trust path: 2)

Shorter trust paths = more likely to vouch.
```

---

## Summary: Gap Closure Status

| # | Gap | Severity | Status | Closed By |
|---|---|---|---|---|
| 1 | Voucher risk/reward | Critical | **CLOSED** | Fix 4 (tiered rates: 12% yield for risky), Fix 7 (insurance: 30% coverage) |
| 2 | Reputation utility | Critical | **CLOSED** | Fix 1 (rep gates borrowing), Fix 2 (decay), Fix 3 (voucher multiplier) |
| 3 | Liquidation incentive | High | **CLOSED** | Fix 10 (1-5% time-decay bounty from insurance pool) |
| 4 | Cold start | Critical | **PLANNED** | Seed circles program + community builder program (see plan above) |
| 5 | Social layer | High | **v2** | Circle groups, badges, referral mechanism |
| 6 | Collusion/grief vectors | High | **CLOSED** | Fix 5 (graduated limits), Fix 12 (48h delay), Fix 13 (3-5 voucher min), Fix 14 (cooldown) |
| 7 | Dispute resolution | Medium | **CLOSED** | Fix 8 (7-day grace period + 2% late fee). Extension voting = v2. |
| 8 | Default cascades | High | **CLOSED** | Fix 6 (max 5 vouches, 40% cap), Fix 11 (circuit breakers: Yellow/Red/Recovery) |
| 9 | Protocol sustainability | Medium | **CLOSED** | Tiered rates increase revenue. Insurance pool at 1%. Protocol fee at 20%. |
| 10 | ENS identity depth | Low | **v2** | Rich profiles, verified mainnet ENS, cross-platform identity |
| 11 | Off-chain communication | Medium | **TODO** | Telegram bot MVP (implementation needed) |
| 12 | Cross-circle trust | Low | **v3** | Circle endorsements, trust path discovery |

### Nash Equilibrium Verification

All CLOSED gaps have been verified against game theory proofs in `GAME_THEORY.md`:

| Player | Dominant Strategy | Verified |
|---|---|---|
| Borrower | Repay (future access > one-time gain at every tier) | Proven (Section 9.1) |
| Voucher | Vouch selectively (EV positive at 85%+ confidence) | Proven (Section 9.2) |
| Liquidator | Liquidate ASAP (bounty > gas always) | Proven (Section 3.3) |
| Attacker | Abstain (all vectors negative EV) | Proven (Section 9.3) |
