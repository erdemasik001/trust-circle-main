# Trust Circle — Next Steps

> From deployment to working mobile app — step-by-step roadmap

---

## Phase 1 — Deploy to Testnet

```bash
# 1. Copy and fill environment variables
cp .env.example .env
# Fill in: PRIVATE_KEY, WORLDCHAIN_SEPOLIA_RPC_URL, WORLDSCAN_API_KEY

# 2. Deploy to World Chain Sepolia
source .env
forge script script/DeployTrustCircle.s.sol:DeployTrustCircle \
  --rpc-url $WORLDCHAIN_SEPOLIA_RPC_URL \
  --broadcast \
  --verify

# 3. Save deployed addresses from the console output
```

---

## Phase 2 — Verify Contracts

Contracts are auto-verified with the `--verify` flag. If verification fails:

```bash
forge verify-contract <ADDRESS> TrustCircle \
  --chain worldchain_sepolia \
  --watch
```

Repeat for each contract: `ReputationEngine`, `InsurancePool`, `CircuitBreaker`, `TrustCircleENS`, `MockWorldID`, `MockERC20`.

---

## Phase 3 — Mobile App Setup (MiniKit 2.0)

Trust Circle runs as a **Mini App inside World App** via MiniKit 2.0. The frontend is a Next.js app rendered in World App's embedded mobile webview — not a standalone web or desktop app.

### 3.1 Scaffold Mobile Mini App

```bash
npx create-next-app@latest app --typescript --tailwind --app
cd app
npm install @worldcoin/minikit-js @worldcoin/minikit-react
npm install wagmi viem @tanstack/react-query
```

### 3.2 Export ABIs

```bash
mkdir -p app/src/abi
cp out/TrustCircle.sol/TrustCircle.json app/src/abi/
cp out/ReputationEngine.sol/ReputationEngine.json app/src/abi/
cp out/InsurancePool.sol/InsurancePool.json app/src/abi/
cp out/CircuitBreaker.sol/CircuitBreaker.json app/src/abi/
cp out/TrustCircleENS.sol/TrustCircleENS.json app/src/abi/
cp out/MockERC20.sol/MockERC20.json app/src/abi/
```

### 3.3 Create Deployed Addresses Config

Create `app/src/config/addresses.ts`:

```typescript
export const addresses = {
  trustCircle: "0x...",
  reputationEngine: "0x...",
  insurancePool: "0x...",
  circuitBreaker: "0x...",
  trustCircleENS: "0x...",
  mockUSDC: "0x...",
  mockWorldID: "0x...",
} as const;
```

### 3.4 Configure MiniKit + wagmi

- Initialize MiniKit in the app root layout
- Add World Chain Sepolia chain definition (chainId: 4801)
- Configure wagmi with MiniKit wallet connector (World App handles signing)
- Wrap app with `MiniKitProvider`, `WagmiProvider`, and `QueryClientProvider`

---

## Phase 4 — Mobile Screens

All screens are designed for **mobile-only** use within World App.

| Screen    | Route        | Purpose                                        |
| --------- | ------------ | ---------------------------------------------- |
| Home      | `/`          | World ID verify + onboarding                   |
| Dashboard | `/dashboard` | Reputation tier, active loans, vouch positions |
| Vouch     | `/vouch`     | Search users, create/manage vouches            |
| Borrow    | `/borrow`    | Calculate available limit, request loan        |
| Repay     | `/repay`     | View active loan details, repay                |
| Profile   | `/profile`   | ENS subname, reputation history, tier progress |

### Key Components

- **TierCard** — Display user's current tier with progress bar to next tier
- **VouchList** — Active vouch positions with amounts and activation status
- **LoanCard** — Active loan details with countdown timer (due date / grace period)
- **HealthBanner** — Protocol health status (GREEN/YELLOW/RED) shown globally
- **RepDecayIndicator** — Shows days until reputation decay starts
- **BottomNav** — Mobile tab navigation (Dashboard / Vouch / Borrow / Profile)

---

## Phase 5 — World ID + MiniKit Integration

### 5.1 MiniKit 2.0 Setup

```typescript
import { MiniKit } from "@worldcoin/minikit-js";

// Initialize in app layout
MiniKit.install();
```

### 5.2 World ID Verification Flow

1. User opens Trust Circle inside World App
2. Taps "Verify with World ID"
3. MiniKit triggers World ID proof generation (biometric orb verification)
4. Proof is sent to `registerWithWorldID()` on TrustCircle contract
5. User is registered with initial reputation of 100

### 5.3 Transaction Signing

- All contract interactions (vouch, borrow, repay) go through MiniKit's `sendTransaction()` API
- World App handles wallet signing natively — no external wallet connection needed
- Transaction confirmations shown via MiniKit's built-in mobile UI

---

## Phase 6 — Arc Testnet Deployment (Secondary Track)

```bash
# Deploy to Arc Testnet for Circle bounty
forge script script/DeployTrustCircle.s.sol:DeployTrustCircle \
  --rpc-url $ARC_TESTNET_RPC_URL \
  --broadcast
```

- Add Arc Testnet chain config alongside World Chain Sepolia
- Support chain switching within the app

---

## Phase 7 — Polish & Submit

### 7.1 Mobile UI/UX

- [ ] Touch-optimized UI — large tap targets, swipe gestures, bottom sheet modals
- [ ] Loading states with skeleton screens
- [ ] Transaction confirmation toasts
- [ ] Error handling with user-friendly messages
- [ ] ENS subname display throughout the app

### 7.2 Demo Preparation

- [ ] Record 3-5 minute demo video on a phone showing full flow:
  - Open Trust Circle in World App
  - Verify with World ID
  - Claim ENS subname (alice.trustcircle.eth)
  - Vouch for another user
  - Borrow against vouches
  - Repay loan, show reputation increase
- [ ] Prepare slides: problem → solution → game theory → demo → architecture

### 7.3 ETHGlobal Submission

- [ ] Write project description highlighting Nash equilibrium design
- [ ] List tracks: World (World ID + MiniKit), ENS (subnames), Arc (stablecoin lending)
- [ ] Link GitHub repo, deployed contracts (WorldScan), and live demo URL
- [ ] Deploy Mini App to Vercel (hosting for MiniKit webview)
- [ ] Register Mini App in World App developer portal

---

## Quick Reference — Deployment Commands

```bash
# Build
forge build

# Test
forge test -vvv

# Gas report
forge test --gas-report

# Deploy (dry run)
forge script script/DeployTrustCircle.s.sol:DeployTrustCircle --rpc-url $WORLDCHAIN_SEPOLIA_RPC_URL

# Deploy (broadcast + verify)
forge script script/DeployTrustCircle.s.sol:DeployTrustCircle --rpc-url $WORLDCHAIN_SEPOLIA_RPC_URL --broadcast --verify

# Verify single contract
forge verify-contract <ADDRESS> <CONTRACT_NAME> --chain worldchain_sepolia --watch
```
