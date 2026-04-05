# Trust Circle — Nash Equilibrium & Mechanism Design

> How to design the game so that **rational self-interest produces collective good**.

---

## 0. Why Nash Equilibrium Matters Here

A Nash Equilibrium is a state where **no player can improve their outcome by changing only their own strategy**, assuming all other players keep theirs unchanged. If Trust Circle's incentives are designed correctly, the Nash Equilibrium IS the desired behavior:

- Borrowers repay on time
- Vouchers vouch for trustworthy people
- Liquidators settle defaults promptly
- Attackers find exploitation unprofitable

If the equilibrium is wrong, rational players will exploit the protocol regardless of what we "hope" they do. **Hope is not a mechanism.** Math is.

---

## 1. The Players

```
┌─────────────────────────────────────────────────────────┐
│                    THE TRUST CIRCLE GAME                 │
│                                                         │
│  PLAYER 1: BORROWER (B)                                │
│  Goal: Maximize capital access, minimize cost            │
│  Strategies: {Repay, Default, Strategic Default}         │
│                                                         │
│  PLAYER 2: VOUCHER (V)                                  │
│  Goal: Maximize yield, minimize loss                     │
│  Strategies: {Vouch Carefully, Vouch Recklessly, Exit}   │
│                                                         │
│  PLAYER 3: LIQUIDATOR (L)                               │
│  Goal: Maximize profit from liquidation                  │
│  Strategies: {Liquidate, Ignore}                         │
│                                                         │
│  PLAYER 4: ATTACKER (A)                                 │
│  Goal: Extract value from the protocol                   │
│  Strategies: {Collude, Sybil, Grief, Abstain}            │
│                                                         │
│  PLAYER 5: PROTOCOL (P) — the mechanism designer        │
│  Goal: Maximize TVL, repayment rate, user growth         │
│  Levers: Interest rate, penalties, rewards, limits       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Game 1: The Borrower-Voucher Game (Core Game)

This is the fundamental interaction. Everything else is built on top of it.

### 2.1 Setup

```
Borrower (B) borrows P dollars, owes P + I (principal + interest)
Voucher (V) stakes S dollars (where S >= P, could be multiple vouchers)
Loan duration: T days
```

### 2.2 Strategy Space

**Borrower strategies:**
- **Repay (R):** Pay back P + I before deadline
- **Default (D):** Don't pay, accept consequences
- **Strategic Default (SD):** Capable of paying but calculates default is cheaper

**Voucher strategies:**
- **Vouch (V):** Stake S dollars for this borrower
- **Don't Vouch (DV):** Keep money, earn 0

### 2.3 Payoff Matrix: Single Loan Game

```
                        BORROWER
                   Repay (R)          Default (D)
              ┌──────────────────┬──────────────────┐
              │                  │                  │
   Vouch (V)  │  V: +Y           │  V: -S           │
              │  B: -I, +Rep     │  B: +P, -Rep     │
              │                  │  (keeps the loan)│
              │  (COOPERATIVE)   │  (EXPLOITATION)  │
              │                  │                  │
VOUCHER       ├──────────────────┼──────────────────┤
              │                  │                  │
   Don't      │  V: 0            │  V: 0            │
   Vouch (DV) │  B: no loan      │  B: no loan      │
              │                  │                  │
              │  (NO GAME)       │  (NO GAME)       │
              │                  │                  │
              └──────────────────┴──────────────────┘

Where:
  Y = Voucher yield = I × 80% (voucher's share of interest)
  S = Amount staked by voucher
  I = Interest owed by borrower
  P = Principal borrowed
  Rep = Reputation change (+10 or -50)
```

### 2.4 The Problem: Current Design

With current numbers (5% interest, 80% voucher share):

```
Loan: 1000 USDC
Interest: 50 USDC (5%)
Voucher yield: 40 USDC (80% of 50)
Voucher risk: 1000 USDC (full stake)

BORROWER'S CALCULATION:
  Repay:   Cost = -50 USDC,  Gain = +10 Rep
  Default: Gain = +1000 USDC, Cost = -50 Rep

  If Rep has no financial value → Default dominates.
  Rational borrower defaults every time.

VOUCHER'S CALCULATION:
  Expected value = P(repay) × 40 - P(default) × 1000
  Break even requires: P(repay) > 96.2%

  Voucher needs >96% confidence borrower will repay.
  That's an insanely high bar.
```

**Current Nash Equilibrium: (Don't Vouch, Default)**
This is a **dead protocol**. No one vouches because rational borrowers default.

### 2.5 The Fix: Making (Vouch, Repay) the Nash Equilibrium

We need to make **Repay** the dominant strategy for the Borrower and **Vouch** rational for the Voucher. Three levers:

#### Lever 1: Make Default Expensive (Increase Borrower's Default Cost)

```
CURRENT:  Default cost = -50 Rep (worthless)
FIXED:    Default cost = -50 Rep + REAL CONSEQUENCES

Real consequences:
  a) Reputation gates borrowing (Rep 0 = can't borrow EVER again)
  b) Reputation is PUBLIC (social shame in your circle)
  c) Graduated access: defaulter loses ALL future credit access
  d) Cooldown: even partial rep recovery takes 6+ months of vouching others

NEW BORROWER CALCULATION:
  Repay:   Cost = -50 USDC | Gain = +10 Rep, future credit access
  Default: Gain = +1000 USDC (one-time) | Cost = permanent credit death

  If future credit access > 1000 USDC in lifetime value → Repay dominates.
```

**Key insight:** The loan must be smaller than the **lifetime value of continued protocol access**. This is why graduated limits matter — a new user borrows 100 USDC, not 10,000.

#### Lever 2: Make Vouching Profitable (Increase Voucher's Expected Value)

```
CURRENT:  Yield = 4% of stake, Risk = 100% of stake
FIXED:    Three changes:

  a) Tiered interest based on borrower risk:
     New user (Rep 100):    15% interest → Voucher gets 12%
     Medium (Rep 300-500):   8% interest → Voucher gets 6.4%
     Trusted (Rep 700+):     3% interest → Voucher gets 2.4%

  b) Insurance pool covers 30% of loss:
     Voucher max loss = 70% of stake (not 100%)

  c) Graduated limits cap exposure:
     First vouch to new user: max 50 USDC
     After 3 repayments: max 500 USDC

NEW VOUCHER CALCULATION (New Borrower):
  Stake: 50 USDC (capped)
  Yield: 6 USDC (12% of 50)
  Max loss: 35 USDC (70% of 50, after insurance)

  Expected value = P(repay) × 6 - P(default) × 35
  Break even: P(repay) > 85.4%

  Much more reasonable. Social knowledge gives vouchers 85%+ confidence
  for people they actually know.
```

#### Lever 3: Make the Game Repeated (Not One-Shot)

```
ONE-SHOT GAME:   Borrower has no future → Default is rational
REPEATED GAME:   Borrower wants future loans → Repay is rational

This is the Folk Theorem applied:
  In an infinitely repeated game, cooperation can be sustained
  as a Nash Equilibrium IF the discount factor is high enough.

  δ > (Gain from defection) / (Gain from defection + Future cooperation value)
  δ > 1000 / (1000 + Lifetime credit access value)

  If lifetime credit access is worth even 2000 USDC → δ > 0.33
  Cooperation (Repay) is sustainable.

MECHANISM:
  - Reputation grows with each repayment → unlocks bigger loans
  - Rep 100 → borrow 100 USDC
  - Rep 300 → borrow 2,000 USDC
  - Rep 700 → borrow 50,000 USDC

  Defaulting on a 100 USDC loan costs you access to 50,000 USDC future loans.
  No rational actor burns $50K of future value for $100 today.
```

### 2.6 New Equilibrium

```
                        BORROWER
                   Repay (R)           Default (D)
              ┌───────────────────┬───────────────────┐
              │                   │                   │
   Vouch (V)  │  V: +12% yield    │  V: -70% stake    │
              │  B: -15% interest │  B: +P one-time   │
              │     +10 Rep       │     -50 Rep       │
              │     +future loans │     -ALL future   │
              │                   │      access       │
              │  ★ NASH EQ ★     │                   │
              │                   │                   │
VOUCHER       ├───────────────────┼───────────────────┤
              │                   │                   │
   Don't      │  V: 0 (FOMO)     │  V: 0             │
   Vouch (DV) │  B: no loan      │  B: no loan       │
              │                   │                   │
              └───────────────────┴───────────────────┘

Nash Equilibrium: (Vouch, Repay) ★
  - Borrower: Repay dominates because future access > one-time gain
  - Voucher: Vouch dominates because 12% yield with 85%+ confidence
  - Neither player benefits from deviating unilaterally
```

---

## 3. Game 2: The Liquidation Game

### 3.1 Setup

```
Loan is overdue. Outstanding debt: D
Liquidator (L) can call liquidateDefaultedLoan()
Gas cost to liquidate: G (~$0.01 on World Chain)
```

### 3.2 Current Payoff (Broken)

```
                     LIQUIDATOR
                Liquidate        Ignore
           ┌─────────────────┬──────────────┐
           │ L: -G (gas)     │ L: 0         │
           │ Protocol: healed│ Protocol: sick│
           └─────────────────┴──────────────┘

Nash Eq: Ignore (dominant strategy — why pay gas for nothing?)
```

### 3.3 Fixed Payoff

```
Introduce: Liquidation Bounty = 2% of outstanding debt
Funded by: Insurance pool (not vouchers)

                     LIQUIDATOR
                Liquidate              Ignore
           ┌──────────────────────┬──────────────┐
           │ L: +0.02D - G        │ L: 0         │
           │    (bounty - gas)     │              │
           │ Protocol: healed     │ Protocol: sick│
           └──────────────────────┴──────────────┘

Example: D = 1000 USDC
  Liquidate: +20 USDC - 0.01 = +$19.99
  Ignore: $0

Nash Eq: Liquidate ★ (dominant strategy when bounty > gas)
```

### 3.4 Multi-Liquidator Competition (First-Mover Game)

```
When multiple liquidators exist, it becomes a race:

  If BOTH liquidate simultaneously: only first tx succeeds
  If ONE liquidates, OTHER gets nothing
  If NEITHER liquidates: loan stays sick

This is a classic "Volunteer's Dilemma" with a twist:
  The bounty makes it a RACE, not a standoff.
  First mover wins. This is the desired behavior.

Nash Eq: Both attempt to liquidate ASAP.
  Protocol health is maintained by competition.
```

### 3.5 Time-Decay Bounty (Advanced)

```
To prevent "wait and see" strategies:

  Day 1 overdue:  Bounty = 1% of D
  Day 3 overdue:  Bounty = 2% of D
  Day 7 overdue:  Bounty = 3% of D
  Day 14 overdue: Bounty = 5% of D

Why: Creates urgency. Early liquidators accept less bounty.
Late liquidation = bigger bounty = guaranteed someone steps in.

Nash Eq: Liquidate as early as profitable.
  Some liquidators accept 1%, guaranteeing fast settlement.
  If no one takes 1%, the rising bounty eventually attracts someone.
```

---

## 4. Game 3: The Voucher Selection Game

This is where the real magic of social collateral lives.

### 4.1 Setup

```
Voucher V must choose WHO to vouch for.
Two potential borrowers:
  B1: Trustworthy (will repay with probability p1 = 95%)
  B2: Risky (will repay with probability p2 = 60%)

Voucher has private information (knows them personally).
```

### 4.2 Payoff Matrix

```
                   B1 (Trustworthy)       B2 (Risky)
              ┌──────────────────────┬──────────────────────┐
              │                      │                      │
  Vouch for   │ EV = 0.95(Y) - 0.05(L) │ EV = 0.60(Y) - 0.40(L) │
  this person │    = 0.95(6) - 0.05(35) │    = 0.60(6) - 0.40(35) │
              │    = 5.70 - 1.75        │    = 3.60 - 14.00       │
              │    = +3.95 ★            │    = -10.40             │
              │                      │                      │
              ├──────────────────────┼──────────────────────┤
              │                      │                      │
  Don't vouch │ EV = 0               │ EV = 0               │
              │                      │                      │
              └──────────────────────┴──────────────────────┘

(Y = 6 USDC yield, L = 35 USDC max loss after insurance, stake = 50 USDC)
```

### 4.3 Nash Equilibrium

```
Rational voucher's strategy:
  - Vouch for B1 (EV = +3.95) ★
  - Don't vouch for B2 (EV = -10.40)

This is EXACTLY what we want.
The mechanism naturally selects for trustworthy borrowers.

Vouchers with PRIVATE INFORMATION (knowing someone personally)
can assess p1 vs p2 far better than any algorithm.

The protocol doesn't need a credit score algorithm.
The VOUCHERS ARE the credit score algorithm.
```

### 4.4 The Information Advantage Principle

```
WHY SOCIAL COLLATERAL WORKS (Game Theory Proof):

Traditional lending:
  Bank estimates P(repay) using public data (credit score, income)
  Information quality: LOW (statistical average, no personal knowledge)
  Result: High rates for everyone, excludes those without data

Trust Circle:
  Voucher estimates P(repay) using PRIVATE information:
    - "I've known Fatma for 5 years"
    - "She always pays her share of rent on time"
    - "She just got a new freelance contract"
    - "She has 3 kids depending on her, she won't risk her reputation"

  Information quality: HIGH (personal, contextual, current)
  Result: Better risk assessment → lower default rate → lower rates

This is a SIGNALING GAME:
  Borrower's signal: "I have people who trust me enough to stake money"
  Signal cost: Must actually maintain real relationships (can't fake this)
  Signal quality: Proportional to vouch amounts (more stake = stronger signal)

Per Spence's Signaling Theory:
  The signal is credible BECAUSE it's costly (vouchers risk real money).
  Cheap talk ("I'm trustworthy") is ignored.
  Costly signals (3 people staked $500 each on me) are credible.
```

---

## 5. Game 4: The Attacker Games

### 5.1 Collusion Attack (Sybil Variant)

```
ATTACK: Alice gets 2 World IDs (buys spare verification).
  Account A vouches $1000 for Account B.
  Account B borrows $1000 and defaults.
  Net: Alice loses $1000 (as voucher) but gains $1000 (as borrower) = $0

  But if Account B has OTHER vouchers too:
    Alice vouches $500, Bob (innocent) vouches $500
    Account B borrows $1000 and defaults
    Alice loses $500, gains $1000 = NET PROFIT $500
    Bob loses $500 (victim)
```

**Defense: Multi-Voucher Requirement + Concentration Limit**

```
RULE 1: Minimum 3 unique vouchers for any loan > $200
RULE 2: No single voucher > 40% of total vouch limit
RULE 3: New vouchers have 48-hour activation delay
RULE 4: Graduated limits (new user borrows max $100)

ATTACKER'S NEW CALCULATION:
  Need 3 World IDs (cost: significant, $50+ each on black market)
  Each vouch needs 48h activation delay
  Max loan: $100 (new user limit)

  Cost of attack: 3 × $50 (IDs) + time = $150+
  Max gain: $100 loan - $40 own vouch = $60

  NET: -$90 (UNPROFITABLE)

Nash Eq: Abstain from attack. ★
```

### 5.2 Grief Attack

```
ATTACK: Malicious user registers, gets vouched by innocent people,
borrows maximum, defaults intentionally to hurt vouchers.

MOTIVATION: Revenge, competition destruction, or just chaos.
```

**Defense: Graduated Trust + Cooling Period**

```
TIMELINE FOR ATTACKER:
  Day 0:   Register with World ID
  Day 0:   Can receive vouches (but nobody knows you yet)
  Day 2:   First vouches activate (48h delay)
  Day 2:   Borrow max $100 (Rep 100 tier, needs 3+ vouchers for >$200)
  Day 37:  Repay → Rep 110, can borrow $150
  Day 67:  Repay → Rep 120, can borrow $200
  ...
  Month 6: Rep 200, can borrow $500
  Month 12: Rep 300, can borrow $2,000

TO GRIEF FOR $2,000:
  Cost: 12 months of active participation, multiple real repayments
  Must convince real people to vouch (social engineering over months)
  Total interest paid during buildup: ~$300+

  NET GAIN FROM GRIEF: $2,000 - $300 (interest paid) = $1,700
  NET COST: 12 months of effort + permanent protocol ban + social shame

PAYOFF:
  Grief:   +$1,700 once, -reputation, -social standing, -future access
  Cooperate: +continuous credit access worth $10,000+ over lifetime

Nash Eq: Cooperate ★ (for any actor with time preference > 0)
```

### 5.3 Flash Loan Style Attack

```
ATTACK: Borrow USDC from Aave → Vouch on Trust Circle →
        Self-borrow → Default → Repay Aave

DEFENSE: Already blocked by design:
  1. Vouching requires USDC approval (not atomic with borrow)
  2. 48-hour vouch activation delay kills flash loans
  3. 3-voucher minimum requires 3 separate wallets
  4. Graduated limits cap new accounts at $100

Nash Eq: Abstain. ★ (Attack is mechanically impossible)
```

### 5.4 Attacker Summary Table

```
┌────────────────────┬───────────────┬────────────────┬──────────────┐
│ Attack             │ Profit w/o    │ Profit with    │ Nash Eq      │
│                    │ Defenses      │ Defenses       │              │
├────────────────────┼───────────────┼────────────────┼──────────────┤
│ Self-collusion     │ +$500         │ -$90           │ Abstain ★    │
│ Grief (instant)    │ +$1,000       │ +$100 max      │ Marginal     │
│ Grief (long-term)  │ +$10,000      │ +$1,700        │ Cooperate ★  │
│ Flash loan         │ +$∞           │ Impossible     │ Abstain ★    │
│ Vouch farming      │ +yield        │ +tiny yield    │ Minimal ★    │
└────────────────────┴───────────────┴────────────────┴──────────────┘
```

---

## 6. Game 5: The Reputation Meta-Game

### 6.1 Reputation as a Repeated Game Currency

```
Reputation is NOT just a number. It's the DISCOUNT FACTOR (δ) in the
repeated game. High rep = high δ = strong incentive to cooperate.

Rep Score → Borrowing Power (Lifetime Expected Value):
  Rep 100:  Can borrow $100     → LEV ≈ $500 over 2 years
  Rep 300:  Can borrow $2,000   → LEV ≈ $10,000 over 2 years
  Rep 500:  Can borrow $10,000  → LEV ≈ $50,000 over 2 years
  Rep 700:  Can borrow $50,000  → LEV ≈ $200,000 over 2 years
  Rep 900:  Can borrow $100,000 → LEV ≈ $500,000 over 2 years

DEFAULT DESTROYS:
  -50 Rep per default
  At Rep 100: one default → Rep 50 → FROZEN (can't borrow)
  At Rep 300: one default → Rep 250 → drops a tier, loses $8K LEV
  At Rep 700: one default → Rep 650 → drops a tier, loses $150K LEV

THE HIGHER YOUR REP, THE MORE YOU HAVE TO LOSE.
This is called "increasing exit cost" — the mechanism's secret weapon.
```

### 6.2 Subgame Perfect Equilibrium

```
In a multi-period game, we need SUBGAME PERFECTION:
  The strategy must be optimal at EVERY stage, not just overall.

BORROWER AT REP 700 CONSIDERING DEFAULT ON $50,000 LOAN:

  Default now:
    Gain: +$50,000 (one time)
    Lose: Rep drops to 650 → tier drops → lose $150K future LEV

  Repay now:
    Cost: -$3,500 (7% interest)
    Gain: Rep → 710 → keep $200K+ future LEV

  At every subgame (every loan decision), Repay dominates.

  Exception: If borrower is LEAVING THE SYSTEM (last interaction).
  This is the "end-game problem" in repeated games.

END-GAME DEFENSE:
  1. Reputation decay: inactive users lose rep → must keep participating
  2. Social cost: default is PUBLIC → your circle knows → real-world shame
  3. Cross-protocol reputation (v3): default follows you to other dApps

  These make the game effectively INFINITE (no clean exit point).
```

---

## 7. The Complete Mechanism: Putting It All Together

### 7.1 Parameter Table (Nash-Balanced)

```
┌─────────────────────────────┬──────────────┬──────────────────────────┐
│ Parameter                   │ Value        │ Game Theory Rationale    │
├─────────────────────────────┼──────────────┼──────────────────────────┤
│ Interest Rate (new user)    │ 15%          │ Compensates voucher risk │
│ Interest Rate (Rep 300+)    │ 8%           │ Lower risk = lower rate  │
│ Interest Rate (Rep 700+)    │ 3%           │ Minimal risk premium     │
│                             │              │                          │
│ Voucher Yield Share         │ 80%          │ Must exceed risk-free    │
│                             │              │ rate to attract capital   │
│                             │              │                          │
│ Insurance Pool Contribution │ 1% of loan   │ Funds loss protection    │
│ Insurance Coverage          │ 30% of loss  │ Reduces voucher risk     │
│                             │              │ from 100% to 70%         │
│                             │              │                          │
│ Liquidation Bounty (Day 1)  │ 1% of debt   │ > gas cost = profitable  │
│ Liquidation Bounty (Day 7)  │ 3% of debt   │ Guarantees settlement    │
│ Liquidation Bounty (Day 14) │ 5% of debt   │ Emergency backstop       │
│                             │              │                          │
│ Grace Period                │ 7 days       │ Reduces accidental       │
│                             │              │ defaults (edge cases)    │
│ Late Fee (grace period)     │ 2%           │ Discourages intentional  │
│                             │              │ lateness                 │
│                             │              │                          │
│ Rep Gain (repay)            │ +10          │ Slow build = commitment  │
│ Rep Loss (default)          │ -50          │ 5x asymmetry = strong    │
│                             │              │ deterrent                │
│ Rep Decay (inactive/month)  │ -5           │ Prevents park-and-exit   │
│                             │              │                          │
│ Min Vouchers per Loan       │ 3            │ Anti-collusion           │
│ Max Single Voucher Share    │ 40%          │ Diversification required │
│ Vouch Activation Delay      │ 48 hours     │ Anti-flash-vouch         │
│ Max Active Vouches/User     │ 5            │ Limits cascade exposure  │
│                             │              │                          │
│ Borrow Limit (Rep 100)     │ $100         │ Limits grief damage      │
│ Borrow Limit (Rep 300)     │ $2,000       │ Earned through behavior  │
│ Borrow Limit (Rep 700)     │ $50,000      │ Requires ~60 repayments  │
│ Borrow Limit (Rep 900)     │ $100,000     │ Requires ~80 repayments  │
└─────────────────────────────┴──────────────┴──────────────────────────┘
```

### 7.2 Equilibrium Verification

For every player, verify no profitable deviation exists:

```
BORROWER (at any rep level):
  ✅ Repay: Costs interest, gains rep, keeps future access
  ❌ Default: Gains principal once, loses 5x more in future LEV
  → Repay is dominant ★

VOUCHER:
  ✅ Vouch for known trustworthy person: EV positive at 85%+ repay rate
  ❌ Vouch for stranger: EV negative (can't assess risk)
  ❌ Don't vouch: Misses yield (opportunity cost in low-rate environment)
  → Selective vouching is dominant ★

LIQUIDATOR:
  ✅ Liquidate ASAP: Earns 1-5% bounty, trivial gas cost
  ❌ Ignore: Misses free money
  → Liquidate is dominant ★

ATTACKER:
  ❌ Collude: Unprofitable after defenses (needs 3 IDs, 48h delay, $100 cap)
  ❌ Grief: Requires months of buildup, gains < future LEV lost
  ❌ Flash loan: Mechanically impossible
  ✅ Abstain: Zero cost, zero risk
  → Abstain is dominant ★

PROTOCOL:
  ✅ All desired behaviors are Nash Equilibria
  ✅ No player benefits from unilateral deviation
  ✅ Attack vectors are unprofitable
  → Mechanism is INCENTIVE COMPATIBLE ★
```

---

## 8. Dynamic Game Flow: The Trust Spiral

### 8.1 Virtuous Spiral (Desired Equilibrium Path)

```
                    ┌──────────────────┐
                    │  NEW USER JOINS  │
                    │  (World ID)      │
                    │  Rep = 100       │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  SMALL VOUCH     │
                    │  Friend stakes   │
                    │  $50 USDC        │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  SMALL BORROW    │
                    │  $100 USDC       │
                    │  15% interest    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  REPAY ON TIME   │◄────────────────┐
                    │  Rep +10 → 110   │                 │
                    └────────┬─────────┘                 │
                             │                           │
                    ┌────────▼─────────┐                 │
                    │  MORE VOUCHERS   │                 │
                    │  "She repaid,    │                 │
                    │   I'll vouch too"│                 │
                    └────────┬─────────┘                 │
                             │                           │
                    ┌────────▼─────────┐                 │
                    │  BIGGER LOAN     │                 │
                    │  $500, then      │                 │
                    │  $2000, then...  │─────────────────┘
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  CIRCLE LEADER   │
                    │  Rep 900+        │
                    │  Vouches for     │
                    │  others          │
                    │  Earns yield     │
                    └──────────────────┘

Each cycle REINFORCES the next:
  More repayments → Higher rep → More vouchers → Bigger loans →
  More repayments → Higher rep → ...

This is a POSITIVE FEEDBACK LOOP grounded in Nash Equilibrium.
Each step is individually rational → the spiral is self-sustaining.
```

### 8.2 Death Spiral (What Happens If Defaults Spike)

```
                    ┌──────────────────┐
                    │  EXTERNAL SHOCK  │
                    │  (recession,     │
                    │   market crash)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  DEFAULT RATE    │
                    │  RISES TO 15%+   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  VOUCHERS LOSE   │
                    │  MONEY           │
                    │  Trust erodes    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  VOUCHERS EXIT   │
                    │  OR REDUCE       │
                    │  VOUCH AMOUNTS   │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  CREDIT DRIES UP │
                    │  Can't borrow    │
                    │  → More defaults │
                    └────────┬─────────┘
                             │
                             ▼
                        PROTOCOL DEATH
```

### 8.3 Circuit Breakers (Death Spiral Prevention)

```
AUTOMATIC TRIGGERS:

  YELLOW ALERT (Default rate > 10% in 7 days):
    → New loan interest rates increase by 50%
    → Max loan amounts decrease by 50%
    → Insurance pool stops accepting withdrawals
    → Notification to all vouchers: "Elevated risk period"

  RED ALERT (Default rate >= 20% in 7 days):
    → All new loans BLOCKED (canCreateLoan = false)
    → Existing loans continue with their current terms
    → Emit HealthChanged(YELLOW, RED, defaultRate)

  RECOVERY MODE (Default rate drops to <= 5%):
    → Parameters gradually return to normal over 14 days
    → System transitions to GREEN after 14-day recovery period
    → Emit HealthChanged(RED/YELLOW, RECOVERY, defaultRate)

GAME THEORY RATIONALE:
  Circuit breakers change the payoff matrix DURING the crisis:
  - Higher rates → vouchers compensated for higher risk
  - Lower limits → reduce maximum damage
  - Pausing → stops the bleeding, prevents panic defaults
  - Extensions → give honest borrowers time, reduce accidental defaults

  These convert the death spiral into a MEAN-REVERTING system.
```

---

## 9. Formal Proofs (Simplified)

### 9.1 Proof: Repayment is Nash Equilibrium

```
THEOREM: Under graduated borrowing limits and reputation gating,
Repay is a Nash Equilibrium strategy for all borrowers with δ > 0.

PROOF:
  Let V(R) = lifetime value of continued access = Σ(future borrow limits)
  Let G(D) = one-time gain from default = current loan principal P
  Let δ = discount factor (time preference, 0 < δ < 1)

  Borrower repays if: δ × V(R) > G(D)

  At Rep 100: V(R) ≥ $500 (minimum, assuming modest future loans)
              G(D) = $100 (max borrow at this tier)
              Need: δ > 100/500 = 0.20

  At Rep 300: V(R) ≥ $10,000
              G(D) = $2,000
              Need: δ > 2000/10000 = 0.20

  At Rep 700: V(R) ≥ $200,000
              G(D) = $50,000
              Need: δ > 50000/200000 = 0.25

  For any δ > 0.25 (i.e., user values future at 25%+ of present),
  Repay is the dominant strategy at EVERY tier.

  Since most humans have δ >> 0.25 for financial decisions,
  Repay is Nash Equilibrium. ∎
```

### 9.2 Proof: Selective Vouching is Optimal

```
THEOREM: Vouchers maximize expected payoff by only vouching for
borrowers they estimate will repay with probability p > p*.

PROOF:
  Let Y = yield from successful loan
  Let L = loss from default (after insurance = 70% of stake)

  EV(vouch) = p × Y - (1-p) × L
  EV(vouch) > 0 when: p > L / (Y + L) = p*

  With current parameters (50 USDC stake, 12% yield, 30% insurance):
    Y = 6 USDC
    L = 35 USDC
    p* = 35 / (6 + 35) = 85.4%

  Voucher vouches IFF they estimate p > 85.4%.

  Personal knowledge gives ~90-95% accuracy for close relationships.
  Statistical average for strangers: ~70% (below threshold).

  Therefore: Vouchers only vouch for people they know well.
  This is exactly the desired behavior. ∎
```

### 9.3 Proof: Attack Unprofitability

```
THEOREM: Under {3-voucher minimum, 40% concentration cap, 48h delay,
graduated limits}, Sybil collusion is negative EV.

PROOF:
  Attack requires:
    - n ≥ 3 World IDs, cost: C_id × 3
    - 48h delay per vouch (minimum 48h attack window)
    - Max borrow at Rep 100 = $100
    - Attacker's own vouches: at least 60% of limit = $60

  Attack gain: $100 (borrowed) - $60 (own vouches lost) = $40
  Attack cost: 3 × C_id + opportunity cost of 48h + gas

  If C_id > $15 (conservative estimate for World ID duplication):
    Cost = $45 + time > $40 = Gain

  NET EV < 0. Attack is unprofitable. ∎
```

---

## 10. Implementation Checklist

### Phase 1: Core Equilibrium (Must Have for Mainnet)

```
□ Reputation-gated borrowing limits (tier table from §7.1)
□ Tiered interest rates based on reputation
□ Insurance pool (1% contribution per loan)
□ Insurance coverage (30% of voucher loss)
□ Liquidation bounty (1-5% time-decay)
□ 7-day grace period with 2% late fee
□ Minimum 3 vouchers per loan > $200
□ Max 40% concentration per voucher
□ 48-hour vouch activation delay
□ Max 5 active vouches per user
□ Rep decay (-5/month inactive)
□ Rep 0 = frozen (cannot borrow)
□ Circuit breakers (yellow/red alert triggers)
```

### Phase 2: Equilibrium Strengthening (V2)

```
□ Voucher risk scoring (portfolio exposure dashboard)
□ Dynamic interest rates (algorithmic based on protocol health)
□ Cross-circle reputation visibility
□ Dispute resolution with arbiter incentives
□ Extension voting by vouchers
□ Sybil detection heuristics (graph analysis)
□ Achievement system (soulbound badges)
```

### Phase 3: Long-Term Stability (V3)

```
□ DAO governance for parameter changes
□ Cross-protocol reputation (ZK proofs)
□ Formal verification of incentive properties
□ Economic simulation (agent-based modeling)
□ Regulatory compliance framework
```

---

## 11. Summary: The Five Laws of Trust Circle

```
LAW 1: DEFAULT MUST COST MORE THAN THE LOAN
  → Graduated limits ensure future access > current loan
  → Reputation loss is 5x gain: -50 vs +10
  → Makes Repay the dominant strategy

LAW 2: VOUCHING MUST PAY MORE THAN DOING NOTHING
  → Tiered yields: 2.4% to 12% based on risk
  → Insurance reduces max loss from 100% to 70%
  → Makes Vouch the rational choice for confident assessors

LAW 3: LIQUIDATION MUST BE PROFITABLE
  → Time-decay bounty: 1% to 5%
  → Near-zero gas on L2
  → Makes Liquidate the dominant strategy

LAW 4: ATTACKS MUST BE UNPROFITABLE
  → Multi-voucher requirement blocks solo collusion
  → Graduated limits cap grief damage
  → Activation delays block flash attacks
  → Makes Abstain the rational choice for attackers

LAW 5: THE GAME MUST NEVER END
  → Reputation decay prevents exit strategy
  → Increasing exit cost with higher rep
  → Social consequences persist beyond protocol
  → Makes the game effectively infinite →
     Folk Theorem guarantees cooperation is sustainable
```

```
┌──────────────────────────────────────────────────┐
│                                                  │
│   When every player's SELFISH optimal strategy   │
│   IS the COOPERATIVE outcome,                    │
│                                                  │
│   you don't need trust.                          │
│   You have MATH.                                 │
│                                                  │
│   That's the Nash Equilibrium of Trust Circle.   │
│                                                  │
└──────────────────────────────────────────────────┘
```
