# Trust Circle — Hackathon Scope (ETHGlobal Cannes 2026)

> **What we're shipping:** A mobile-first Mini App inside World App — social lending powered by reputation, not collateral.
> **Platform:** Mobile (World App MiniKit 2.0)
> **Chains:** World Chain Sepolia (primary) + Arc Testnet (secondary)
> **Max 3 Partner Prizes:** World + ENS + Arc

---

## 1. Product Definition: Mobile App

Trust Circle is a **mobile application** built as a **World App Mini App** using MiniKit 2.0 SDK. It runs natively inside the World App on iOS and Android — no separate app store listing, no standalone APK. Users discover and launch Trust Circle directly from the World App ecosystem.

### Why Mobile-Only

1. **World App is mobile.** MiniKit 2.0 Mini Apps live inside World App, which is a mobile wallet. Building for desktop first would mean building something that doesn't fit the primary distribution channel.

2. **Target users are mobile-first.** The 1.4B unbanked adults Trust Circle serves access the internet primarily through smartphones. A desktop-first product misses the audience entirely.

3. **World ID verification is mobile.** Orb and device-level verification happen on the phone. The proof generation flow is native to World App.

4. **Hackathon scope discipline.** Building one excellent mobile experience beats building a mediocre responsive web app. Every screen, every interaction, every component is designed for thumb-reach and small screens.

### Mobile App Architecture

```
┌─────────────────────────────────────────────┐
│              WORLD APP (Host)               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │       Trust Circle Mini App           │  │
│  │       (MiniKit 2.0 Embedded)          │  │
│  │                                       │  │
│  │  ┌─────────────────────────────────┐  │  │
│  │  │  Next.js (Mobile-Optimized)     │  │  │
│  │  │                                 │  │  │
│  │  │  • Touch-first UI (shadcn/ui)   │  │  │
│  │  │  • Bottom tab navigation        │  │  │
│  │  │  • Swipe gestures               │  │  │
│  │  │  • Native-feel transitions      │  │  │
│  │  │  • Pull-to-refresh              │  │  │
│  │  │  • Haptic feedback (MiniKit)    │  │  │
│  │  └─────────────────────────────────┘  │  │
│  │                                       │  │
│  │  MiniKit SDK Commands:                │  │
│  │  • verify() → World ID 4.0 proof     │  │
│  │  • pay() → USDC transfers            │  │
│  │  • walletAuth() → wallet connection   │  │
│  │  • sendTransaction() → contract calls │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  World App provides:                        │
│  • Wallet (keys never leave device)         │
│  • World ID identity                        │
│  • World Chain RPC                          │
│  • Push notifications                       │
└─────────────────────────────────────────────┘
```

### Mobile Screen Map (5 Core Screens)

```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ Onboard │→ │  Home   │  │ Borrow  │  │  Vouch  │  │ Profile │
│         │  │Dashboard│  │         │  │         │  │         │
│ WorldID │  │         │  │ Tier    │  │ Search  │  │ Rep     │
│ Verify  │  │ Rep     │  │ Limit   │  │ User    │  │ Score   │
│    +    │  │ Badge   │  │ Amount  │  │ Amount  │  │ Tier    │
│ ENS     │  │ Credit  │  │ Terms   │  │ 48h     │  │ History │
│ Claim   │  │ Limit   │  │ Warning │  │ Notice  │  │ Vouches │
│         │  │ Loan    │  │ Confirm │  │ Confirm │  │ Loans   │
│         │  │ Health  │  │         │  │         │  │         │
└─────────┘  └────┬────┘  └─────────┘  └─────────┘  └─────────┘
                  │
            ┌─────┴─────┐
            │   Repay   │
            │           │
            │  Balance  │
            │  Grace    │
            │  Period   │
            │  Confirm  │
            └───────────┘

Bottom Navigation: [Home] [Borrow] [Vouch] [Profile]
```

---

## 2. Hackathon Scope — What We Ship

### IN SCOPE (Must Ship)

#### Smart Contracts (Foundry, Solidity 0.8.24)

| Contract | Status | Priority |
|----------|--------|----------|
| ReputationEngine.sol | Done | — |
| InsurancePool.sol | Done | — |
| CircuitBreaker.sol | Done | — |
| Constants.sol + Errors.sol | Done | — |
| Interfaces (all 5) | Done | — |
| **TrustCircleV2.sol** | **To Build** | **P0 — Core** |
| TrustCircleENS.sol | To Build | P1 — ENS Track |
| Deploy scripts (Foundry) | To Build | P0 |
| Tests (full lifecycle) | To Build | P0 |

**TrustCircleV2.sol must implement:**
- `register()` — World ID 4.0 verification, initial rep = 100
- `vouch()` — USDC stake, 48h activation delay, max 5 positions, 40% concentration cap
- `borrow()` — tier-gated, min voucher count, circuit breaker check, 1% insurance contribution
- `repay()` — partial payments, grace period (7 days), late fee (2%), overpayment refund
- `liquidate()` — post-grace, bounty payout (1-5% time-decay), voucher slash (70%), insurance cover (30%)
- State: users, vouches, loans, reputation scores, cooldowns

#### Mobile App (Next.js 14 + MiniKit 2.0)

| Screen | Features | Priority |
|--------|----------|----------|
| Onboard | World ID verify → ENS claim → dashboard | P0 |
| Dashboard | Rep badge, tier, credit limit, active loan, system health | P0 |
| Borrow | Tier info → amount slider → terms → warning → confirm | P0 |
| Vouch | ENS search → borrower profile → amount → 48h notice → confirm | P0 |
| Repay | Balance due → grace period display → confirm | P0 |
| Profile | Rep score, tier, loan history, vouch history | P1 |

#### Deployments

| Target | Purpose | Priority |
|--------|---------|----------|
| World Chain Sepolia | Primary — World + ENS bounties | P0 |
| Arc Testnet | Secondary — Arc bounty | P1 |
| Vercel | Frontend hosting | P0 |

#### Integrations

| Integration | What | Priority |
|-------------|------|----------|
| World ID 4.0 | ZKP verification in contract + MiniKit proof flow | P0 |
| MiniKit 2.0 | Mini App SDK — verify, pay, sendTransaction | P0 |
| ENS L2 Subnames | *.trustcircle.eth claim + resolution + rep in text records | P1 |
| USDC (ERC20) | All lending flows | P0 |

### OUT OF SCOPE (Won't Ship at Hackathon)

| Feature | Why Excluded |
|---------|-------------|
| AgentKit liquidation bot | Stretch goal — only if core done early |
| Telegram notifications | Nice-to-have, not demo-critical |
| Supabase backend / caching | On-chain reads are sufficient for MVP |
| Circle groups (off-chain) | Social feature, not lending core |
| Cross-chain USDC (Arc chain abstraction) | Would need CCTP integration |
| Achievement badges | Gamification layer, post-hackathon |
| DAO governance | Production feature |
| The Graph indexing | Direct RPC reads for hackathon |
| Desktop/web responsive | Mobile-only via MiniKit |

---

## 3. Demo Flow (3 Minutes Max)

The hackathon demo tells **Fatma's story** on a phone screen:

```
0:00 — INTRO (15 sec)
  "Trust Circle: borrow without collateral, backed by people who trust you."
  Show: App icon in World App → open Mini App

0:15 — REGISTER (30 sec)
  Fatma opens Trust Circle → taps "Verify with World ID"
  World ID 4.0 proof generated → on-chain registration
  Claims "fatma.trustcircle.eth" ENS subname
  Show: Newcomer badge (Rep 100), $100 limit, 15% rate

0:45 — GET VOUCHED (30 sec)
  Switch to Mehmet's phone (or simulate)
  Mehmet searches "fatma.trustcircle.eth" → sees her profile
  Vouches $50 USDC → "Activates in 48 hours" notice
  (For demo: skip activation delay or use mock)
  Fatma's dashboard updates: credit limit = $37.50 (0.75x multiplier)

1:15 — BORROW (45 sec)
  Fatma taps "Borrow" → sees tier info (Newcomer: max $100, 15%, 14 days)
  Slides amount to $37 → terms preview shows:
    Principal: $37.00
    Interest (15% APR, 14 days): $0.21
    Insurance (1%): $0.37
    Total due: $37.21
    Due date: [14 days from now]
  Taps confirm → TX signed → loan created
  Dashboard shows active loan with countdown

2:00 — REPAY (30 sec)
  14 days later (or simulate)
  Fatma taps "Repay" → sees $37.21 due
  Repays in full → TX confirmed
  Rep score: 100 → 110 (+10)
  Mehmet earns yield: $0.17 (80% of interest)
  Show: tier progress bar moving toward Rising (200)

2:30 — SYSTEM FEATURES (30 sec)
  Quick scroll through:
  • System Health badge: GREEN
  • Insurance Pool: $0.37 balance
  • Profile: 1 loan repaid, 110 rep, Newcomer tier
  • "With 9 more repayments, Fatma reaches Rising tier: $500 limit at 12%"

3:00 — END
  "Credit for everyone, collateral from no one."
  Show: QR code to try the app
```

---

## 4. Technical Scope Summary

### Repo Structure (Hackathon Final)

```
Trust-Circle/
├── src/                              # Foundry contracts
│   ├── core/
│   │   ├── TrustCircleV2.sol         ← TO BUILD (main contract)
│   │   ├── ReputationEngine.sol      ✅ Done
│   │   ├── InsurancePool.sol         ✅ Done
│   │   └── CircuitBreaker.sol        ✅ Done
│   ├── identity/
│   │   └── TrustCircleENS.sol        ← TO BUILD (ENS track)
│   ├── interfaces/                   ✅ Done (all 5)
│   ├── libraries/                    ✅ Done (Constants, Errors)
│   └── mocks/                        ← TO BUILD (MockWorldID, MockERC20)
│
├── test/                             ← TO BUILD
│   ├── TrustCircleV2.t.sol
│   ├── ReputationEngine.t.sol
│   ├── InsurancePool.t.sol
│   └── Integration.t.sol
│
├── script/                           ← TO BUILD
│   ├── DeployWorldChain.s.sol
│   └── DeployArc.s.sol
│
├── app/                              ← TO BUILD (mobile Mini App)
│   ├── layout.tsx
│   ├── page.tsx                      # Onboarding
│   ├── dashboard/page.tsx
│   ├── borrow/page.tsx
│   ├── vouch/page.tsx
│   ├── repay/page.tsx
│   └── profile/page.tsx
│
├── docs/                             ✅ Complete
│   ├── HACKATHON_IDEA.md
│   ├── PRD.md
│   ├── SYSTEM_FIX.md
│   ├── GAME_THEORY.md
│   ├── SYSTEM_NARRATIVE.md
│   ├── HACKATHON_SCOPE.md            # This document
│   ├── TRACKS.md
│   ├── SISTEM_OZETI.md
│   ├── FINAL_PLAN.md
│   ├── MVP_INFRA.md
│   └── GAPS.md
│
├── foundry.toml                      ✅ Done
└── .env.example                      ✅ Done
```

### Build Order (Critical Path)

```
DAY 1 (Contracts)
  Morning:   TrustCircleV2.sol — register + vouch + borrow
  Afternoon: TrustCircleV2.sol — repay + liquidate + integration with support contracts
  Evening:   Tests + Deploy to World Chain Sepolia + Arc Testnet

DAY 2 (Mobile App)
  Morning:   Next.js + MiniKit 2.0 setup + Onboarding (World ID + ENS)
  Afternoon: Dashboard + Borrow flow + Vouch flow
  Evening:   Repay flow + Profile + all contract hooks connected

DAY 3 (Polish + Submit)
  Morning:   ENS integration polish (text records, resolution in all screens)
  Afternoon: Arc deployment verification + architecture diagram
  Evening:   Demo video recording + README + submission
```

### Tech Stack (Final)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Contracts | Foundry + Solidity 0.8.24 | Fast compilation, native fuzzing |
| Frontend | Next.js 14 (App Router) | MiniKit compatible, SSR |
| UI | Tailwind CSS + shadcn/ui | Mobile-first components |
| Web3 | wagmi v2 + viem | Type-safe contract interaction |
| Wallet | MiniKit 2.0 SDK | Native World App integration |
| State | TanStack Query | Cache contract reads, auto-refresh |
| Identity | World ID 4.0 + ENS L2 | Sybil resistance + human-readable names |
| Chain | World Chain Sepolia | Target L2, near-zero gas |
| Hosting | Vercel | Free, instant deploys |

---

## 5. Success Criteria

### Minimum Viable Demo (Must Achieve)
- [ ] User registers with World ID on mobile
- [ ] User claims ENS subname
- [ ] User gets vouched (USDC staked)
- [ ] User borrows (tier-gated, insurance contribution deducted)
- [ ] User repays (reputation increases)
- [ ] All on World Chain Sepolia

### Strong Submission (Target)
- [ ] All minimum + grace period handling visible
- [ ] Vouch activation delay (48h) shown in UI
- [ ] System health badge (circuit breaker state)
- [ ] Insurance pool balance visible
- [ ] Deployed on both World Chain Sepolia + Arc Testnet
- [ ] ENS text records store rep score

### Exceptional (Stretch)
- [ ] Liquidation flow demo (default → bounty → slash → insurance)
- [ ] AgentKit liquidation bot
- [ ] Full tier progression visualization
- [ ] Demo video under 2 minutes with clear narrative

---

## 6. Bounty Submission Checklist

### World — World ID 4.0 ($8K)
- [ ] World ID 4.0 ZKP verification in TrustCircleV2.sol
- [ ] Proof validation in smart contract (not just backend)
- [ ] Protocol demonstrably "breaks without proof of human"
- [ ] Sybil resistance as core mechanism (not add-on)

### World — MiniKit 2.0 ($4K)
- [ ] Mini App built with MiniKit 2.0 SDK
- [ ] MiniKit SDK Commands used (verify, pay, sendTransaction)
- [ ] Contracts deployed to World Chain
- [ ] Not gambling or chance-based

### ENS — Most Creative Use ($5K)
- [ ] ENS subnames as portable credit identity
- [ ] Rep score stored in ENS text records
- [ ] Forward + reverse resolution in all flows
- [ ] Present at ENS booth Sunday morning
- [ ] Functional demo (no hard-coded values)

### Arc — Advanced Stablecoin Logic ($3K)
- [ ] Contracts deployed on Arc Testnet
- [ ] Advanced USDC logic: conditional escrow, tiered yield, proportional slashing, insurance pool
- [ ] Architecture diagram
- [ ] Video demonstration
- [ ] Public GitHub repo

---

*Scope locked. Build the phone, not the PowerPoint.*
