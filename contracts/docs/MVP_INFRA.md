# Trust Circle — MVP Infrastructure & Architecture

> Everything needed to go from "contracts deployed" to "working product people can use"

---

## 1. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                                                                  │
│   World App (MiniKit)          Web Browser           Telegram    │
│   ┌────────────────┐     ┌────────────────┐    ┌──────────────┐ │
│   │  MiniKit 2.0   │     │  Next.js PWA   │    │  Alert Bot   │ │
│   │  Embedded View │     │  Standalone    │    │  Reminders   │ │
│   └───────┬────────┘     └───────┬────────┘    └──────┬───────┘ │
│           │                      │                    │          │
└───────────┼──────────────────────┼────────────────────┼──────────┘
            │                      │                    │
            ▼                      ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                          │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                   Next.js API Routes                     │   │
│   │                                                          │   │
│   │  /api/verify     → World ID proof verification          │   │
│   │  /api/profile    → User profile + tier + rep decay calc │   │
│   │  /api/circles    → Circle discovery & management        │   │
│   │  /api/notify     → Notification dispatch                │   │
│   │  /api/health     → Protocol health + circuit breaker    │   │
│   │  /api/tiers      → Tier table + user's current tier     │   │
│   │  /api/insurance  → Insurance pool balance & stats       │   │
│   └──────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
│   ┌──────────────────────┼──────────────────────────────────┐   │
│   │              Event Indexer (Background)                   │   │
│   │                                                          │   │
│   │  Listens to on-chain events → Updates cache → Triggers   │   │
│   │  notifications → Computes analytics                      │   │
│   └──────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
│                   World Chain Sepolia (4801)                      │
│                                                                  │
│   ┌──────────────────┐  ┌────────────────┐  ┌───────────────┐  │
│   │ TrustCircle V2   │  │ TrustCircleENS │  │  MockWorldID  │  │
│   │ (Lending +       │  │ (Identity)     │  │  (ZKP Verify) │  │
│   │  ReputationEngine│  └────────────────┘  └───────────────┘  │
│   │  TierManager     │                                          │
│   │  InsurancePool   │                                          │
│   │  CircuitBreaker  │                                          │
│   │  AntiExploit     │                                          │
│   │  GracePeriod)    │                                          │
│   └──────┬───────────┘                                          │
│          │                                                       │
│   ┌──────┴───────┐  ┌────────────────┐                          │
│   │   MockARC    │  │  MockERC20     │                          │
│   │ (Yield/Slash)│  │  (Test USDC)   │                          │
│   └──────────────┘  └────────────────┘                          │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                      DATA / CACHE LAYER                          │
│                                                                  │
│   ┌──────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│   │   Supabase   │  │    Redis       │  │  The Graph        │  │
│   │  (Profiles,  │  │  (Session,     │  │  (Event Indexing) │  │
│   │   Circles,   │  │   Rate Limit)  │  │  (Optional v2)    │  │
│   │   Notifs)    │  │                │  │                    │  │
│   └──────────────┘  └────────────────┘  └───────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Frontend
| Component | Technology | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR for SEO, API routes, MiniKit compatibility |
| Styling | **Tailwind CSS + shadcn/ui** | Fast prototyping, clean mobile-first design |
| Web3 | **wagmi v2 + viem** | Type-safe, modern React hooks for Ethereum |
| Wallet | **World App MiniKit 2.0** | Primary wallet for World Chain users |
| Wallet (fallback) | **RainbowKit** | For desktop/non-World-App users |
| State | **TanStack Query** | Cache contract reads, auto-refresh |
| Charts | **Recharts** | Reputation history, circle analytics |

### Backend (Minimal — Hackathon Scope)
| Component | Technology | Why |
|---|---|---|
| API | **Next.js API Routes** | Zero extra infrastructure |
| Database | **Supabase (Postgres)** | Free tier, real-time, auth built-in |
| Cache | **Vercel KV (Redis)** | Session management, rate limiting |
| Notifications | **Telegram Bot API** | Simplest notification for MVP |
| Hosting | **Vercel** | Free, instant deploys, edge functions |

### Blockchain
| Component | Technology | Why |
|---|---|---|
| Network | **World Chain Sepolia** | Target L2, near-zero gas |
| Contracts | **Solidity 0.8.20 + Hardhat** | Already deployed |
| Indexing | **Custom event listener (ethers.js)** | Simple, no external dependency for MVP |
| Indexing (v2) | **The Graph** | Decentralized, production-grade |

---

## 3. Frontend Architecture

### 3.1 Page Structure

```
app/
├── layout.tsx                    # Root layout (providers, nav)
├── page.tsx                      # Landing page / marketing
│
├── onboard/
│   ├── page.tsx                  # World ID verification
│   └── claim-name/
│       └── page.tsx              # ENS subname claim
│
├── dashboard/
│   └── page.tsx                  # Main dashboard (profile, tier, loans, vouches, system health)
│
├── borrow/
│   └── page.tsx                  # Borrow flow (tier limits → amount → preview → confirm)
│
├── vouch/
│   ├── page.tsx                  # Search user → set vouch amount
│   └── [address]/
│       └── page.tsx              # Vouch for specific user
│
├── repay/
│   └── page.tsx                  # Repay active loan
│
├── circle/
│   ├── page.tsx                  # My circle view
│   └── [id]/
│       └── page.tsx              # Specific circle details
│
├── profile/
│   └── [address]/
│       └── page.tsx              # Public profile (rep, history)
│
└── api/
    ├── verify/route.ts           # World ID backend verification
    ├── profile/route.ts          # Aggregated profile data
    ├── circles/route.ts          # Circle management
    ├── notify/route.ts           # Notification triggers
    └── health/route.ts           # Protocol metrics
```

### 3.2 Key Components

```
components/
├── providers/
│   ├── Web3Provider.tsx          # wagmi + RainbowKit + MiniKit
│   └── QueryProvider.tsx         # TanStack Query
│
├── layout/
│   ├── Navbar.tsx                # Navigation with wallet connect
│   ├── MobileNav.tsx             # Bottom tabs for mobile
│   └── Footer.tsx
│
├── dashboard/
│   ├── ProfileCard.tsx           # Name, avatar, rep score, TIER BADGE
│   ├── TierProgress.tsx          # Current tier + progress to next tier
│   ├── CreditLimitBar.tsx        # Visual: available / tier max / total vouch
│   ├── ActiveLoanCard.tsx        # Countdown timer, grace period indicator, repay button
│   ├── VouchList.tsx             # Who vouches for me (with activation countdown)
│   ├── SystemHealthBadge.tsx     # Green/Yellow/Red circuit breaker status
│   ├── InsurancePoolCard.tsx     # Pool balance + coverage info
│   └── QuickActions.tsx          # Borrow / Vouch / Repay buttons
│
├── borrow/
│   ├── TierInfoCard.tsx          # Your tier, max borrow, interest rate, duration
│   ├── AmountSlider.tsx          # Borrow amount selector (capped by tier + vouches)
│   ├── TermsPreview.tsx          # Tier-based interest, duration, insurance contrib (1%)
│   ├── VoucherBreakdown.tsx      # Which vouchers fund this, activation status
│   ├── DefaultWarning.tsx        # Clear consequences: vouch loss, rep drop, freeze
│   └── ConfirmBorrow.tsx         # Final confirmation + tx
│
├── vouch/
│   ├── UserSearch.tsx            # ENS name search
│   ├── BorrowerCard.tsx          # Profile + rep + history
│   ├── VouchAmountInput.tsx      # Amount + USDC approval
│   └── ConfirmVouch.tsx          # Final confirmation + tx
│
├── shared/
│   ├── ReputationBadge.tsx       # Visual rep score + tier name (color-coded)
│   ├── TierBadge.tsx             # Frozen/Newcomer/Rising/Building/Trusted/Established/Leader
│   ├── LoanStatusBadge.tsx       # Active / Grace Period / Repaid / Defaulted
│   ├── CountdownTimer.tsx        # Days:hours:minutes (due date + grace period)
│   ├── VouchActivationTimer.tsx  # 48h countdown for pending vouches
│   ├── TxButton.tsx              # Approve → Execute pattern
│   ├── ENSAvatar.tsx             # Resolve + display avatar
│   ├── AmountDisplay.tsx         # Format USDC with decimals
│   └── InsuranceBadge.tsx        # "30% insured" indicator on vouch cards
│
└── hooks/
    ├── useTrustCircle.ts         # Contract read/write hooks
    ├── useENS.ts                 # ENS resolution hooks
    ├── useUserProfile.ts         # Aggregated profile data
    ├── useLoan.ts                # Active loan state
    ├── useVouches.ts             # Vouch management
    └── useMiniKit.ts             # World ID proof flow
```

---

## 4. Smart Contract Integration Layer

### 4.1 Contract Hooks (wagmi)

```typescript
// hooks/useTrustCircle.ts — Key patterns

// READ: User profile
const { data: profile } = useReadContract({
  address: TRUST_CIRCLE_ADDRESS,
  abi: TrustCircleABI,
  functionName: 'getUserProfile',
  args: [userAddress],
})

// READ: Available borrow limit
const { data: limit } = useReadContract({
  address: TRUST_CIRCLE_ADDRESS,
  abi: TrustCircleABI,
  functionName: 'getAvailableLimit',
  args: [userAddress],
})

// WRITE: Borrow (single tx)
const { writeContract: borrow } = useWriteContract()
borrow({
  address: TRUST_CIRCLE_ADDRESS,
  abi: TrustCircleABI,
  functionName: 'borrow',
  args: [amount],
})

// WRITE: Vouch (2-step: approve + vouch)
// Step 1: Approve USDC
// Step 2: vouchForUser(borrower, amount)
```

### 4.2 Event Listener (Backend)

```typescript
// services/eventListener.ts — Runs as background process

const events = [
  'UserRegistered',
  'VouchCreated',
  'LoanCreated',
  'LoanRepaid',
  'LoanDefaulted',
  'ReputationUpdated',
]

// On each event:
// 1. Update Supabase cache
// 2. Trigger notifications
// 3. Update analytics
```

---

## 5. Data Layer

### 5.1 Supabase Schema

```sql
-- Cached from on-chain (event-driven updates)
CREATE TABLE users (
  address TEXT PRIMARY KEY,
  ens_name TEXT,
  reputation_score INTEGER DEFAULT 100,
  reputation_tier TEXT DEFAULT 'Newcomer',  -- Frozen/Newcomer/Rising/Building/Trusted/Established/Leader
  total_vouches_received BIGINT DEFAULT 0,
  total_borrowed BIGINT DEFAULT 0,
  active_vouch_count INTEGER DEFAULT 0,     -- max 5
  last_activity_at TIMESTAMP,               -- for rep decay calc
  default_cooldown_until TIMESTAMP,         -- null = not frozen
  registered_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Circle management (off-chain only)
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_address TEXT REFERENCES users(address),
  invite_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE circle_members (
  circle_id UUID REFERENCES circles(id),
  user_address TEXT REFERENCES users(address),
  role TEXT DEFAULT 'member', -- 'admin', 'member'
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_address)
);

-- Notification preferences (off-chain)
CREATE TABLE notification_prefs (
  user_address TEXT PRIMARY KEY REFERENCES users(address),
  telegram_chat_id TEXT,
  email TEXT,
  notify_vouch_received BOOLEAN DEFAULT TRUE,
  notify_loan_taken BOOLEAN DEFAULT TRUE,
  notify_due_reminder BOOLEAN DEFAULT TRUE,
  notify_default_warning BOOLEAN DEFAULT TRUE
);

-- Cached loan history (for fast queries)
CREATE TABLE loan_cache (
  loan_id INTEGER PRIMARY KEY,
  borrower_address TEXT REFERENCES users(address),
  principal BIGINT,
  total_due BIGINT,
  interest_rate_bps INTEGER,               -- tier-based rate
  insurance_contribution BIGINT,           -- 1% of principal
  status TEXT, -- 'active', 'grace', 'repaid', 'defaulted'
  due_date TIMESTAMP,
  grace_period_end TIMESTAMP,              -- due_date + 7 days
  voucher_count INTEGER,                   -- how many vouchers back this
  created_at TIMESTAMP
);

-- Insurance pool tracking (off-chain cache of on-chain state)
CREATE TABLE insurance_pool (
  id INTEGER PRIMARY KEY DEFAULT 1,
  balance BIGINT DEFAULT 0,
  total_contributions BIGINT DEFAULT 0,
  total_payouts BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System health tracking (for circuit breaker dashboard)
CREATE TABLE system_health (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT DEFAULT 'GREEN',             -- GREEN/YELLOW/RED/RECOVERY
  active_loans_count INTEGER DEFAULT 0,
  defaults_last_7_days INTEGER DEFAULT 0,
  default_rate_bps INTEGER DEFAULT 0,
  last_checked_at TIMESTAMP DEFAULT NOW()
);

-- Vouch activation tracking
CREATE TABLE vouch_cache (
  voucher_address TEXT,
  borrower_address TEXT,
  amount BIGINT,
  activates_at TIMESTAMP,                  -- 48h after creation
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  PRIMARY KEY (voucher_address, borrower_address)
);
```

### 5.2 What's On-Chain vs Off-Chain

```
ON-CHAIN (Source of Truth)          OFF-CHAIN (Cache + Extensions)
─────────────────────────           ──────────────────────────────
User registration                   Circle groups & membership
Reputation scores + tier calc       Circle names & descriptions
Vouch amounts + activation delay    Notification preferences
Loan lifecycle + grace period       Telegram/email contacts
Insurance pool balance              Analytics & aggregations
Circuit breaker state               Search indexes
ENS subnames                        User avatars & bios
Token balances                      Rep decay display (computed)
ARC staking records                 System health dashboard
Anti-exploit rules (concentration,  Vouch activation countdown UI
  min vouchers, cooldown)
```

---

## 6. Notification Infrastructure

### 6.1 Telegram Bot (MVP)

```
Architecture:
  On-chain Event → Event Listener → Supabase Check → Telegram Bot API

Setup:
  1. Create bot via @BotFather
  2. User connects: /start in bot → enters wallet address → bot stores chat_id
  3. Events trigger messages automatically

Message Templates:
  VOUCH_RECEIVED:     "{voucher} vouched {amount} USDC for you! Activates in 48h. Limit: {total}."
  VOUCH_ACTIVATED:    "Your vouch from {voucher} is now active. You can borrow up to {limit}."
  LOAN_TAKEN:         "Your vouch of {amount} USDC is now backing a loan for {borrower}."
  DUE_REMINDER_7D:    "Reminder: Your {amount} USDC loan is due in 7 days."
  DUE_REMINDER_1D:    "URGENT: Your loan is due TOMORROW. Repay {remaining} USDC now."
  GRACE_PERIOD:       "Your loan is OVERDUE. You have 7 days grace period. 2% late fee applies."
  GRACE_WARNING_3D:   "Grace period ends in 3 days. After that, your vouchers get slashed."
  LOAN_REPAID:        "Loan repaid! You earned {yield} USDC yield. Your rep is now {score}."
  LOAN_DEFAULTED:     "WARNING: {borrower} defaulted. Your {amount} was slashed (insurance covered {covered})."
  LIQUIDATION_BOUNTY: "You earned {bounty} USDC for liquidating {borrower}'s loan."
  REP_UPDATED:        "Your rep is now {score} (Tier: {tier}). {next_tier_info}"
  TIER_UPGRADE:       "You've reached {tier} tier! New limit: {maxBorrow} at {rate}% interest."
  ACCOUNT_FROZEN:     "Your account is frozen (Rep < 100). Cooldown ends {date}. Recover by vouching for others."
  CIRCUIT_BREAKER:    "System alert: {status}. {details}"
```

### 6.2 Reminder Cron Job

```
Every hour, check:
  - Vouches activating in < 4h → notify voucher "your vouch activates soon"
  - Loans due in 7 days → send reminder (once)
  - Loans due in 3 days → send reminder (once)
  - Loans due in 1 day → send URGENT reminder (once)
  - Loans in grace period → notify borrower daily + vouchers once
  - Grace period ending in 3 days → send URGENT to borrower
  - Loans past grace period → alert liquidators (bounty available)
  - System health check → recalculate default rate → update circuit breaker
  - Rep decay check → flag users approaching tier boundaries

Implementation: Vercel Cron or simple setInterval on backend
```

---

## 7. World ID Integration Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend    │     │  World App   │     │  Backend     │
│  (Next.js)  │     │  (MiniKit)   │     │  (API Route) │
└──────┬──────┘     └──────┬───────┘     └──────┬───────┘
       │                   │                    │
       │  1. Click         │                    │
       │  "Verify"         │                    │
       │──────────────────>│                    │
       │                   │                    │
       │                   │  2. Orb/Device     │
       │                   │  verification      │
       │                   │  (ZKP generated)   │
       │                   │                    │
       │  3. Proof payload │                    │
       │<──────────────────│                    │
       │                   │                    │
       │  4. Send proof    │                    │
       │  to backend       │                    │
       │────────────────────────────────────────>
       │                   │                    │
       │                   │  5. Verify proof   │
       │                   │  with World ID API │
       │                   │                    │
       │  6. Proof valid   │                    │
       │<────────────────────────────────────────
       │                   │                    │
       │  7. Call          │                    │
       │  registerWithWorldID()                 │
       │  on-chain         │                    │
       │                   │                    │
       │  8. TX confirmed  │                    │
       │  → Dashboard      │                    │
```

---

## 8. Deployment & DevOps

### 8.1 Environment Variables

```env
# .env.local (Frontend)
NEXT_PUBLIC_WORLD_CHAIN_RPC=https://worldchain-sepolia.g.alchemy.com/public
NEXT_PUBLIC_CHAIN_ID=4801
NEXT_PUBLIC_TRUST_CIRCLE_ADDRESS=0x60908FABa833EDFd6335d4583226f532e1232768
NEXT_PUBLIC_ENS_ADDRESS=0x847E05665a467D51321722c1f209D59Ccf5E1c57
NEXT_PUBLIC_USDC_ADDRESS=0xF2e74E9e3f363a037ff65fcD97eE1Dd818756255
NEXT_PUBLIC_WORLD_APP_ID=app_staging_trustcircle
NEXT_PUBLIC_WORLD_ACTION=vouch

# Backend
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
TELEGRAM_BOT_TOKEN=xxx
PRIVATE_KEY=xxx  # For event listener only (read-only OK)
```

### 8.2 Deployment Pipeline

```
GitHub Push → Vercel Auto Deploy
                │
                ├── Build Next.js
                ├── Run TypeScript checks
                ├── Deploy to Vercel Edge
                └── Health check ping

Contracts (separate):
  npx hardhat run scripts/deploy.js --network worldchain_sepolia
  → Outputs addresses to frontend-integration/
  → Commit & push → triggers frontend redeploy
```

### 8.3 Monitoring (Post-Hackathon)

```
Minimal monitoring stack:
  - Vercel Analytics (frontend performance)
  - Supabase Dashboard (database metrics)
  - Custom /api/health endpoint:
    - Total users registered (by tier breakdown)
    - Active loans count + value
    - Protocol TVL (total USDC in contract)
    - Default rate (last 7 days) + circuit breaker status
    - Insurance pool balance + payout history
    - Liquidation bounties paid (total)
    - Average reputation score (by cohort)
    - Vouch activation queue (pending vouches)
    - System health: GREEN / YELLOW / RED / RECOVERY
```

---

## 9. Security Considerations

### Frontend Security
```
1. Never expose private keys in frontend
2. All contract writes require user wallet signature
3. API routes validate request origin
4. Rate limiting on all endpoints (Vercel KV)
5. CSP headers to prevent XSS
```

### Contract Interaction Safety
```
1. Always simulate transactions before sending (viem simulateContract)
2. Show clear confirmation dialogs with exact amounts
3. Handle all custom errors with user-friendly messages
4. Display gas estimates before confirmation
5. Implement transaction status tracking (pending → confirmed → failed)
```

### Data Privacy
```
1. No KYC data stored anywhere
2. World ID proof is zero-knowledge
3. Telegram chat IDs stored encrypted in Supabase
4. No analytics tracking without consent
5. All on-chain data is public by design (users are informed)
```

---

## 10. Implementation Roadmap

### Phase 1: Hackathon MVP (Week 1) — CURRENT
```
Day 1-2: Contract V2 + Project setup
  [x] Smart contracts V1 deployed
  [x] ABIs and addresses exported
  [x] Frontend integration guide written
  [x] Game theory analysis complete (GAME_THEORY.md)
  [x] System fix plan complete (SYSTEM_FIX.md)
  [ ] Deploy TrustCircle V2 with Nash-balanced fixes:
      [ ] Reputation tier system (Fix 1) — gates borrowing
      [ ] Tiered interest rates (Fix 4) — 2-15% by tier
      [ ] Graduated borrow limits (Fix 5) — $100 to $100K
      [ ] Insurance pool (Fix 7) — 1% contribution, 30% coverage
      [ ] Grace period (Fix 8) — 7 days + 2% late fee
      [ ] Overpayment refund (Fix 9)
      [ ] Liquidation bounty (Fix 10) — 1-5% time-decay
      [ ] Vouch activation delay (Fix 12) — 48 hours
      [ ] Min voucher count (Fix 13) — 3 for >$200, 5 for >$2K
      [ ] Rep-zero freeze + cooldown (Fix 14) — 30 days
  [ ] Next.js project scaffolded
  [ ] wagmi + MiniKit configured
  [ ] Basic layout + navigation

Day 3-4: Core flows (Nash-aware UI)
  [ ] World ID registration page
  [ ] ENS subname claim page
  [ ] Dashboard with tier badge, system health, insurance info
  [ ] Borrow flow (tier limits → amount → terms preview → default warning → confirm)
  [ ] Vouch flow (search → profile + rep tier → 48h activation notice → confirm)
  [ ] Repay flow (with grace period handling + late fee display)

Day 5: Polish + Demo
  [ ] Mobile-responsive design
  [ ] Error handling for all custom errors
  [ ] Loading states and transaction tracking
  [ ] Tier progression visualization
  [ ] Demo walkthrough: registration → vouch (48h skip for demo) → borrow → repay → tier up
```

### Phase 2: Post-Hackathon Beta (Month 1-2)
```
  [ ] Remaining Nash fixes (if not in Phase 1):
      [ ] Vouch concentration limits (Fix 6) — max 40%, max 5 positions
      [ ] Reputation decay (Fix 2) — -5/month after 90 days
      [ ] Voucher rep multiplier (Fix 3) — 0.5x to 1.5x
      [ ] Circuit breakers (Fix 11) — Yellow/Red/Recovery
  [ ] Supabase integration for circles
  [ ] Telegram notification bot (all 15 message types)
  [ ] Event indexer for cached data
  [ ] Circle creation and management UI
  [ ] Loan history page
  [ ] System health dashboard (Green/Yellow/Red)
  [ ] Insurance pool stats page
```

### Phase 3: Production Readiness (Month 3-4)
```
  [ ] Smart contract audit (all 14 Nash-balanced fixes included)
  [ ] Seed circle program (cold start, Gap 4)
  [ ] The Graph subgraph for indexing
  [ ] Formal verification of incentive properties
  [ ] Agent-based economic simulation
  [ ] Mainnet deployment
```

### Phase 4: Growth (Month 5+)
```
  [ ] Community builder program
  [ ] Achievement/badge system (soulbound)
  [ ] Extension voting system (voucher majority)
  [ ] Cross-circle endorsements + trust path discovery
  [ ] Reputation API for external protocols (ZK proofs)
  [ ] CCIP-Read for mainnet ENS resolution
  [ ] DAO governance for parameter changes
```

---

## 11. Cost Estimate

### Hackathon (Free Tier Everything)
| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | $0 |
| Supabase | Free | $0 |
| World Chain Sepolia | Testnet | $0 |
| Alchemy RPC | Free tier | $0 |
| Telegram Bot | Free | $0 |
| **Total** | | **$0/month** |

### Beta (Low Volume)
| Service | Plan | Cost |
|---|---|---|
| Vercel | Pro | $20/month |
| Supabase | Pro | $25/month |
| Alchemy RPC | Growth | $49/month |
| Domain | .eth + DNS | $30/year |
| **Total** | | **~$100/month** |

### Production
| Service | Plan | Cost |
|---|---|---|
| Vercel | Team | $100/month |
| Supabase | Team | $599/month |
| Alchemy RPC | Scale | $199/month |
| The Graph | Hosted | $50/month |
| Monitoring | Datadog | $100/month |
| Audit | One-time | $25,000-50,000 |
| **Total** | | **~$1,000/month + audit** |
