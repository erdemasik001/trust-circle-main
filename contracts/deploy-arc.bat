@echo off
REM ============================================================
REM Deploy TrustCircle to Arc Testnet (Windows)
REM ============================================================
REM
REM Prerequisites:
REM   1. Foundry installed (forge, cast)
REM   2. .env file with PRIVATE_KEY set to a funded wallet
REM   3. Wallet must have native USDC on Arc Testnet
REM      Get from: https://faucet.circle.com/ (select Arc Testnet)
REM
REM Usage:
REM   deploy-arc.bat
REM
REM ============================================================

echo.
echo ============================================
echo   TrustCircle - Arc Testnet Deployment
echo ============================================
echo.

REM Step 1: Compile
echo [1/3] Compiling contracts...
forge build --silent
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed!
    exit /b 1
)
echo   Compilation successful.
echo.

REM Step 2: Deploy
echo [2/3] Deploying to Arc Testnet...
echo.

forge script script/DeployTrustCircle.s.sol:DeployTrustCircle --rpc-url https://rpc.testnet.arc.network --broadcast --slow -vvv

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   Deployment failed! Check the output above.
    echo   Make sure your wallet has USDC on Arc Testnet.
    echo   Faucet: https://faucet.circle.com/
    exit /b 1
)

echo.
echo ============================================
echo   [3/3] Deployment Complete!
echo ============================================
echo.
echo   Copy the contract addresses from above
echo   and paste them into trust-circle\.env:
echo.
echo   NEXT_PUBLIC_ARC_TRUST_CIRCLE=0x...
echo   NEXT_PUBLIC_ARC_REPUTATION_ENGINE=0x...
echo   NEXT_PUBLIC_ARC_INSURANCE_POOL=0x...
echo   NEXT_PUBLIC_ARC_CIRCUIT_BREAKER=0x...
echo   NEXT_PUBLIC_ARC_TRUST_CIRCLE_ENS=0x...
echo   NEXT_PUBLIC_ARC_MOCK_USDC=0x...
echo   NEXT_PUBLIC_ARC_MOCK_WORLD_ID=0x...
echo.
echo   Then restart your Next.js dev server.
echo ============================================
