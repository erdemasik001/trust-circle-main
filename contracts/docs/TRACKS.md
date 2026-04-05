# Trust Circle — Track & Bounty Assignment

> **Rule:** Max 3 Partner Prizes per project (+ ETHGlobal Finalist separately)
> **Selected Partners:** World ($20K) + ENS ($10K) + Arc ($15K)
> **Realistic Target:** $16K (1st/2nd place across 3 partners)
> **Ceiling:** $45K (sweep all sub-tracks)
> **Raw track data:** See [tracks_raw.md](tracks_raw.md) for full sponsor details.

---

## Selected Tracks: Detailed Breakdown

### PARTNER 1: WORLD — $20,000 Total

| Sub-Track | Prize | Our Fit | Integration | Status |
|-----------|-------|---------|-------------|--------|
| **World ID 4.0** | $8,000 (1st: $4K, 2nd: $2.5K, 3rd: $1.5K) | **Perfect** — protocol literally breaks without it | ZKP verification in TrustCircleV2.sol, nullifier tracking, one-human-one-account | **Primary** |
| **MiniKit 2.0** | $4,000 (1st: $2K, 2nd: $1.25K, 3rd: $750) | **Perfect** — our app IS a Mini App | Full MiniKit SDK integration, contracts on World Chain, mobile-native | **Primary** |
| **AgentKit** | $8,000 (1st: $4K, 2nd: $2.5K, 3rd: $1.5K) | Stretch — needs liquidation agent | Agent auto-discovers defaults, triggers liquidation, earns bounty | **Stretch** |

**Our Narrative for World Judges:**

> "Trust Circle is the use case World ID was built for. Without proof-of-personhood, our Nash equilibrium collapses — one person creates 10 accounts, vouches for themselves, borrows, defaults, repeats. World ID isn't an add-on; it's the load-bearing wall. Remove it and the building falls."

**Requirements Met:**
- [x] Uses World ID 4.0 as a real constraint (registration eligibility, uniqueness, Sybil resistance)
- [x] Proof validation in smart contract (not just backend)
- [x] Mini App with MiniKit 2.0
- [x] MiniKit SDK Commands (verify, pay, sendTransaction)
- [x] Contracts deployed to World Chain
- [x] Not gambling or chance-based

**Expected Prize:** $4K–$6K (World ID 4.0 1st/2nd + MiniKit 3rd)

---

### PARTNER 2: ENS — $10,000 Total

| Sub-Track | Prize | Our Fit | Integration | Status |
|-----------|-------|---------|-------------|--------|
| **Most Creative Use** | $5,000 (1st: $2.5K, 2nd: $1.5K, 3rd: $1K) | **Excellent** — credit identity via subnames is genuinely novel | *.trustcircle.eth subnames, rep in text records, portable credit profile | **Primary** |
| **AI Agent ENS** | $5,000 (1st: $2.5K, 2nd: $1.5K, 3rd: $1K) | Stretch — needs AgentKit first | Liquidation agent fleet with ENS identities (agent.trustcircle.eth) | **Stretch (if AgentKit built)** |

**Our Narrative for ENS Judges:**

> "We use ENS subnames as portable credit identity — not just names, but trust signals. fatma.trustcircle.eth isn't just an address lookup; it's a credit profile. Her reputation score, tier status, and loan history are stored in ENS text records. Any protocol can read her creditworthiness via standard ENS resolution. This is credit scoring, decentralized."

**Requirements Met:**
- [x] ENS obviously improves the product (identity + discovery + credit portability)
- [x] Beyond name-to-address lookups (credit scoring in text records)
- [x] Functional demo (no hard-coded values)
- [ ] Present at ENS booth Sunday morning ← **CRITICAL: Don't miss this**

**What Makes This Creative:**
1. Subnames as credit profiles, not vanity names
2. Rep score + tier stored in text records (machine-readable creditworthiness)
3. Vouch discovery via ENS (search "fatma.trustcircle.eth" to see if she's trustworthy)
4. Portable credit: other protocols can read Trust Circle reputation via ENS
5. L2 subnames on World Chain (not mainnet — cost-effective for unbanked users)

**Expected Prize:** $2.5K–$5K (1st or 2nd place)

---

### PARTNER 3: ARC (Circle) — $15,000 Total

| Sub-Track | Prize | Our Fit | Integration | Status |
|-----------|-------|---------|-------------|--------|
| **Advanced Stablecoin Logic** | $3,000 | **Excellent** — our entire protocol is USDC logic | Conditional escrow, tiered yield, proportional slashing, insurance pool | **Primary** |
| **Chain Abstracted USDC** | $3,000 | Medium — same contracts on Arc | Cross-chain USDC liquidity | **Bonus if time** |
| **Agentic Nanopayments** | $6,000 (1st: $4K, 2nd: $2K) | Stretch — needs agent + micropayments | Liquidation agent nanopayments | **Stretch** |
| **Prediction Markets** | $3,000 | No fit | — | **Skip** |

**Our Narrative for Arc Judges:**

> "Trust Circle is the most sophisticated USDC escrow ever built for a hackathon. Every dollar moves through programmable logic: conditional release (vouch → borrow → repay OR slash), tiered yield distribution (80/20 split at tier-based rates), proportional slashing (70% loss, 30% insured), and an autonomous insurance pool funded by 1% of every loan. This isn't just 'using USDC' — it's a complete lending protocol with six distinct USDC flow patterns."

**USDC Flow Patterns (for Arc submission):**

```
1. VOUCH DEPOSIT:   Voucher → TrustCircle (USDC locked as social collateral)
2. INSURANCE:       1% of borrow → InsurancePool (automatic contribution)
3. BORROW:          TrustCircle → Borrower (tier-gated disbursement)
4. REPAY:           Borrower → TrustCircle → Vouchers (80% yield) + Protocol (20%)
5. SLASH:           TrustCircle slashes 70% of vouch → InsurancePool covers 30%
6. BOUNTY:          InsurancePool → Liquidator (1-5% time-decay bounty)
```

**Requirements Met:**
- [x] Functional MVP
- [ ] Architecture diagram ← **Must create for submission**
- [ ] Video demonstration
- [x] Public GitHub repo
- [x] Advanced programmable logic (escrow, yield, slashing, insurance)

**Expected Prize:** $3K (Advanced Stablecoin Logic)

---

## Why NOT the Other 9 Sponsors

| Sponsor | Prize | Reason for Skip |
|---------|-------|-----------------|
| **Chainlink** ($7K) | CRE, Feeds, Privacy | We don't need oracles — all data is on-chain. Weak narrative vs. our top 3. |
| **Unlink** ($5K) | Private transactions | Transparency is actually a feature for us (public credit profiles). Small prize. |
| **Dynamic** ($5K) | Wallet SDK | Just swapping wallet SDK is not compelling. We already have MiniKit. |
| **WalletConnect** ($5K) | Pay | Repayment via WC Pay is decent but weaker narrative than our top 3. |
| **0G** ($15K) | AI L1 | Different chain entirely. Would need to port everything. No synergy. |
| **Hedera** ($15K) | Hashgraph | Different chain. No EVM in "No Solidity" track. |
| **Uniswap** ($10K) | DEX API | We have no DEX component. Zero fit. |
| **Flare** ($10K) | Data oracle L1 | Different chain, TEE focus. No fit. |
| **Ledger** ($10K) | Hardware wallet | Niche — our users don't have Ledgers. They have phones. |

---

## Prize Strategy Matrix

```
                    EFFORT TO WIN
                    Low         Medium        High
                ┌───────────┬─────────────┬───────────┐
    High ($8K+) │ World ID  │             │ AgentKit  │
                │ ★★★★★     │             │ ★★★       │
PRIZE           ├───────────┼─────────────┼───────────┤
VALUE   Medium  │ MiniKit   │ ENS Creative│ Arc Chain │
        ($3-5K) │ ★★★★★     │ ★★★★        │ Abstracted│
                │           │             │ ★★        │
                ├───────────┼─────────────┼───────────┤
    Low (<$3K)  │ Arc Stable│             │           │
                │ ★★★★      │             │           │
                └───────────┴─────────────┴───────────┘

★ = Priority (more stars = higher priority for our time)
```

---

## Submission Timeline

| When | What | For Which Track |
|------|------|-----------------|
| Day 1 | Contracts deployed to World Chain Sepolia | World + ENS + Arc |
| Day 2 | Contracts deployed to Arc Testnet | Arc |
| Day 2 | Mobile app functional with World ID + ENS | World + ENS |
| Day 3 AM | ENS text records + resolution polish | ENS |
| Day 3 AM | **Present at ENS booth** (Sunday morning) | ENS — **mandatory** |
| Day 3 PM | Architecture diagram for Arc | Arc |
| Day 3 PM | Demo video (max 3 min) | All tracks |
| Day 3 PM | GitHub repo cleanup + README | All tracks |
| Day 3 EVE | Submit on ETHGlobal platform | All tracks |

---

## Expected Outcome

| Scenario | World | ENS | Arc | Total |
|----------|-------|-----|-----|-------|
| **Conservative** | $1.5K (3rd ID) | $1K (3rd) | $3K (1st) | **$5.5K** |
| **Realistic** | $4K (1st ID) + $750 (3rd MiniKit) | $2.5K (1st) | $3K (1st) | **$10.25K** |
| **Optimistic** | $4K (1st ID) + $2K (1st MiniKit) | $2.5K (1st) | $3K (1st) | **$11.5K** |
| **Best Case** | $4K + $2K + $4K (AgentKit) | $2.5K + $2.5K (AI Agent) | $3K + $3K | **$21K** |

**Target: $10K+ from 3 partner prizes + ETHGlobal Finalist consideration.**

---

*Pick your battles. Win the ones you pick.*
