#!/bin/bash
# ============================================================
# Deploy TrustCircle to Arc Testnet
# ============================================================
#
# Prerequisites:
#   1. Foundry installed (forge, cast)
#   2. .env file with PRIVATE_KEY set to a funded wallet
#   3. Wallet must have native USDC on Arc Testnet (gas token)
#      - Get from: https://faucet.circle.com/ (select Arc Testnet)
#
# Usage:
#   chmod +x deploy-arc.sh
#   ./deploy-arc.sh
#
# ============================================================

set -e

# Load environment variables
source .env

ARC_RPC="https://rpc.testnet.arc.network"
CHAIN_ID=5042002

echo ""
echo "============================================"
echo "  TrustCircle — Arc Testnet Deployment"
echo "============================================"
echo ""

# Step 1: Verify wallet balance
echo "[1/4] Checking deployer balance..."
DEPLOYER=$(cast wallet address --private-key "$PRIVATE_KEY")
BALANCE=$(cast balance "$DEPLOYER" --rpc-url "$ARC_RPC")
echo "  Deployer:  $DEPLOYER"
echo "  Balance:   $BALANCE"

if [ "$BALANCE" = "0" ]; then
  echo ""
  echo "  ERROR: Deployer has 0 balance!"
  echo "  Fund your wallet at https://faucet.circle.com/ (Arc Testnet)"
  echo "  Address: $DEPLOYER"
  exit 1
fi
echo ""

# Step 2: Compile contracts
echo "[2/4] Compiling contracts..."
forge build --silent
echo "  Compilation successful."
echo ""

# Step 3: Deploy
echo "[3/4] Deploying contracts to Arc Testnet (chain $CHAIN_ID)..."
echo ""

OUTPUT=$(forge script script/DeployTrustCircle.s.sol:DeployTrustCircle \
  --rpc-url "$ARC_RPC" \
  --broadcast \
  --slow \
  -vvv 2>&1)

echo "$OUTPUT"

# Step 4: Extract addresses and generate .env snippet
echo ""
echo "============================================"
echo "  [4/4] Generating frontend .env snippet"
echo "============================================"
echo ""

# Parse addresses from forge output
TRUST_CIRCLE=$(echo "$OUTPUT" | grep "TrustCircle deployed at:" | awk '{print $NF}')
REP_ENGINE=$(echo "$OUTPUT" | grep "ReputationEngine deployed at:" | awk '{print $NF}')
INSURANCE=$(echo "$OUTPUT" | grep "InsurancePool deployed at:" | awk '{print $NF}')
CIRCUIT=$(echo "$OUTPUT" | grep "CircuitBreaker deployed at:" | awk '{print $NF}')
ENS=$(echo "$OUTPUT" | grep "TrustCircleENS deployed at:" | awk '{print $NF}')
USDC=$(echo "$OUTPUT" | grep "MockUSDC deployed at:" | awk '{print $NF}')
WORLD_ID=$(echo "$OUTPUT" | grep "MockWorldID deployed at:" | awk '{print $NF}')

if [ -z "$TRUST_CIRCLE" ]; then
  echo "  Could not parse addresses from output."
  echo "  Check the forge output above for errors."
  exit 1
fi

# Write to file
ENV_FILE="arc-deployed-addresses.env"
cat > "$ENV_FILE" << EOF
# Arc Testnet deployed addresses ($(date +%Y-%m-%d))
# Copy these into your frontend .env file

NEXT_PUBLIC_ARC_TRUST_CIRCLE=$TRUST_CIRCLE
NEXT_PUBLIC_ARC_REPUTATION_ENGINE=$REP_ENGINE
NEXT_PUBLIC_ARC_INSURANCE_POOL=$INSURANCE
NEXT_PUBLIC_ARC_CIRCUIT_BREAKER=$CIRCUIT
NEXT_PUBLIC_ARC_TRUST_CIRCLE_ENS=$ENS
NEXT_PUBLIC_ARC_MOCK_USDC=$USDC
NEXT_PUBLIC_ARC_MOCK_WORLD_ID=$WORLD_ID
EOF

echo "  Addresses saved to: $ENV_FILE"
echo ""
cat "$ENV_FILE"
echo ""
echo "============================================"
echo "  Next steps:"
echo "  1. Copy the addresses above"
echo "  2. Paste into trust-circle/.env"
echo "  3. Restart the Next.js dev server"
echo "============================================"
