# Trust Circle — Hackathon Idea & Problem Statement

> **Hackathon:** Cannes Hackathon 2026
> **Tracks:** World Chain (MiniKit 2.0) + ENS L2 Subnames
> **Team:** Trust Circle

---

## The Problem

### 2.5 Billion People Are Financially Invisible

The global credit system is broken for the majority of the world's population:

- **1.4 billion adults** have zero access to formal financial services (World Bank, 2024)
- **In emerging markets**, 70%+ of people have no credit score — not because they're risky, but because they have no formal financial footprint
- **Traditional collateral requirements** (property, assets, employment records) exclude the very people who need credit most: small vendors, gig workers, migrants, students
- **Microfinance** charges 20-80% APR and still requires physical presence and paperwork
- **DeFi lending** (Aave, Compound) requires 150%+ overcollateralization — you need to be rich to borrow

### The Trust Paradox

In every community — from villages in Southeast Asia to immigrant neighborhoods in Europe — **people already lend to each other based on trust**. A shopkeeper vouches for a neighbor. A family member guarantees a friend's debt. This informal "social collateral" system moves **$500B+ annually** worldwide (estimated).

But this system has fatal flaws:
- **No enforcement** — verbal promises break
- **No record** — good borrowers can't build portable reputation
- **No scale** — trust doesn't travel beyond your immediate circle
- **No yield** — guarantors take risk but earn nothing

### Why Now?

Three technologies have matured simultaneously:

| Technology | What It Enables |
|---|---|
| **World ID (Orb/Device)** | Proof-of-personhood without KYC — one human, one identity, zero documents |
| **World Chain (L2)** | Near-zero gas fees make micro-lending economically viable |
| **ENS L2 Subnames** | Human-readable identities (`alice.trustcircle.eth`) replace hex addresses |

For the first time, we can formalize informal trust into an on-chain, enforceable, reputation-building credit system — without banks, without documents, without collateral.

---

## The Solution

### Trust Circle: Social Collateral Lending Protocol

Trust Circle replaces financial collateral with **social collateral**. Instead of locking up assets, borrowers are backed by people who know and trust them.

### How It Works (30-Second Version)

```
1. PROVE YOU'RE HUMAN    → World ID verification (no KYC, no documents)
2. GET YOUR NAME         → Claim "alice.trustcircle.eth" (human-readable identity)
3. BUILD YOUR CIRCLE     → Friends/family vouch for you with real USDC (48h activation)
4. START SMALL           → First loan: max $100 at 15% interest (newcomer tier)
5. REPAY & GROW          → Pay back, earn +10 rep, unlock bigger loans & lower rates
6. LEVEL UP              → Rep 300 → $2K | Rep 500 → $10K | Rep 900 → $100K at 2%
7. DEFAULT & LOSE        → Vouchers lose 70% (insurance covers 30%). You're frozen.
                           Liquidator earns 1-5% bounty. Your credit access dies.
```

### The Key Insight

**Skin in the game creates accountability.**

When your friend stakes real money on your promise, the social pressure to repay is stronger than any legal contract. And when that friend earns yield for taking the risk, they're incentivized to vouch for trustworthy people.

This creates a **Nash-balanced trust network** where every player's selfish optimal strategy IS the cooperative outcome:
- Good borrowers attract more vouchers → larger loans → lower rates → more opportunity
- Bad borrowers get frozen (Rep < 100) → 30-day cooldown → must rebuild by helping others
- Vouchers are rewarded for good judgment (up to 12% yield) and protected by insurance (30% loss coverage)
- Liquidators earn bounties (1-5%) → defaults are settled within hours, not days
- Attackers find exploitation unprofitable → 3-voucher minimum, 48h delay, graduated limits

---

## What It Solves

### For the Unbanked (Borrowers)
| Problem | Trust Circle Solution |
|---|---|
| No credit score | On-chain reputation score (0-1000) that unlocks real tiers: limits, rates, duration |
| No collateral | Social collateral from people who trust you |
| No bank account needed | Just a World App wallet |
| No documents | World ID = proof of personhood, zero paperwork |
| Predatory rates | 2%-15% interest based on reputation tier (vs. 20-80% microfinance) |
| No credit history portability | Reputation is on-chain, portable, verifiable by anyone |
| No progression path | Graduated access: $100 → $500 → $2K → $10K → $50K → $100K as you prove yourself |

### For Vouchers (Guarantors)
| Problem | Trust Circle Solution |
|---|---|
| Risk without reward | Earn 80% of loan interest (up to 12% effective yield for high-risk tiers) |
| No enforcement | Smart contract auto-enforces: repay or get slashed |
| Unlimited liability | Max loss = 70% of stake (insurance pool covers 30%) |
| Too much exposure | Max 5 active vouches, max 40% to any single borrower |
| No visibility | On-chain tracking of every vouch, loan, repayment + Telegram alerts |
| Backing strangers | 48h vouch activation + borrower rep visible before committing |

### For the Ecosystem
| Problem | Trust Circle Solution |
|---|---|
| Sybil attacks in DeFi | World ID proof-of-personhood blocks fake accounts |
| Hex address UX | ENS subnames make identities human-readable |
| Credit scoring monopoly | Open, permissionless, on-chain reputation anyone can read |
| Financial exclusion | Anyone with a phone + World ID can participate |

---

## Market Opportunity

### Total Addressable Market (TAM)
- **Global informal lending**: $500B+ annually
- **Microfinance market**: $180B (growing 11% CAGR)
- **Unbanked population**: 1.4B adults

### Serviceable Addressable Market (SAM)
- **World App users**: 10M+ verified humans (as of 2026)
- **World Chain transaction volume**: Growing L2 with near-zero fees
- **Target**: Emerging market users in World App ecosystem

### Beachhead Market
- **Turkish diaspora & students** — High smartphone penetration, strong social lending culture ("borç al/ver"), World App adoption growing
- **Southeast Asian gig workers** — Community-based lending already exists informally
- **African mobile money users** — M-Pesa culture already normalized digital peer lending

---

## Competitive Landscape

| Protocol | Collateral | Identity | Target User | Weakness |
|---|---|---|---|---|
| **Aave/Compound** | 150%+ crypto | None | Crypto whales | Excludes everyone without assets |
| **Goldfinch** | Off-chain underwriting | KYC | Businesses | Complex, slow, institutional |
| **Maple Finance** | Reputation (institutional) | KYC | Institutions | Not for individuals |
| **Lending Club** | Credit score | SSN/ID | US residents | Geography-locked, centralized |
| **Trust Circle** | **Social vouching** | **World ID** | **Anyone with a phone** | New, unproven model |

### Our Moat
1. **World ID integration** — Only protocol with Sybil-resistant, KYC-free identity
2. **Social graph as collateral** — Can't be replicated without the trust network
3. **Nash-balanced mechanism** — Game-theoretically proven: every player's selfish strategy = cooperative outcome
4. **Reputation portability** — On-chain score that gates real financial access (not just a number)
5. **ENS identity layer** — Human-readable names for non-technical users
6. **Insurance + circuit breakers** — System-level protections that prevent death spirals

### vs. "Credit" by Divine (1.5M users on World App)
| | Credit | Trust Circle |
|---|---|---|
| Model | Centralized (platform lends) | Decentralized (peers vouch) |
| Risk bearer | Platform treasury | Vouchers (insured at 30%) |
| Max loan | $1,000 | $100,000 (at Rep 900) |
| Yield for backers | None | Up to 12% |
| Reputation | Black box | On-chain, transparent, portable |

> "Credit is Web2 lending in a Web3 wrapper. Trust Circle is what lending looks like when it's truly peer-to-peer, Nash-balanced, and provably fair."

---

## Hackathon Tracks & Fit

### Track 1: World Chain (MiniKit 2.0)
- Full MiniKit 2.0 integration for World App
- World ID proof-of-personhood for registration
- Deployed on World Chain Sepolia
- Native stablecoin (USDC) lending

### Track 2: ENS L2 Subnames
- L2-native subname registry (`*.trustcircle.eth`)
- Human-readable identity for all users
- Forward + reverse resolution
- Optional mainnet ENS linking

---

## One-Line Pitch

> **Trust Circle turns your social network into your credit score — letting anyone borrow without collateral, backed only by people who believe in them.**
