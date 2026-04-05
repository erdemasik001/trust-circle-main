// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {TrustCircle} from "../src/core/TrustCircle.sol";
import {ReputationEngine} from "../src/core/ReputationEngine.sol";
import {InsurancePool} from "../src/core/InsurancePool.sol";
import {CircuitBreaker} from "../src/core/CircuitBreaker.sol";
import {TrustCircleENS} from "../src/identity/TrustCircleENS.sol";
import {MockWorldID} from "../src/mocks/MockWorldID.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";

contract DeployTrustCircle is Script {
    // ── Deployed contract addresses ──────────────────────────────────
    MockWorldID public mockWorldId;
    MockERC20 public mockUSDC;
    ReputationEngine public repEngine;
    InsurancePool public insurancePool;
    CircuitBreaker public circuitBreaker;
    TrustCircle public trustCircle;
    TrustCircleENS public trustCircleENS;

    // ── World ID config ──────────────────────────────────────────────
    uint256 constant GROUP_ID = 1;
    string constant APP_ID = "app_trust_circle";
    string constant ACTION = "register";

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // ─── Step 1: Deploy mock/external dependencies ───────────────
        mockWorldId = new MockWorldID();
        console2.log("MockWorldID deployed at:", address(mockWorldId));

        mockUSDC = new MockERC20("USD Coin", "USDC");
        console2.log("MockUSDC deployed at:", address(mockUSDC));

        // ─── Step 2: Deploy core modules ─────────────────────────────
        repEngine = new ReputationEngine();
        console2.log("ReputationEngine deployed at:", address(repEngine));

        insurancePool = new InsurancePool(address(mockUSDC));
        console2.log("InsurancePool deployed at:", address(insurancePool));

        circuitBreaker = new CircuitBreaker();
        console2.log("CircuitBreaker deployed at:", address(circuitBreaker));

        // ─── Step 3: Deploy main protocol ────────────────────────────
        trustCircle = new TrustCircle(
            address(mockWorldId),
            address(mockUSDC),
            address(repEngine),
            address(insurancePool),
            address(circuitBreaker),
            GROUP_ID,
            APP_ID,
            ACTION
        );
        console2.log("TrustCircle deployed at:", address(trustCircle));

        // ─── Step 4: Deploy identity layer ───────────────────────────
        trustCircleENS = new TrustCircleENS();
        console2.log("TrustCircleENS deployed at:", address(trustCircleENS));

        // ─── Step 5: Wire contracts together ─────────────────────────
        insurancePool.setTrustCircle(address(trustCircle));
        circuitBreaker.setTrustCircle(address(trustCircle));
        trustCircleENS.setTrustCircle(address(trustCircle));
        console2.log("All contracts wired to TrustCircle");

        // ─── Step 6: Mint test USDC to deployer ─────────────────────
        address deployer = vm.addr(deployerPrivateKey);
        mockUSDC.mint(deployer, 1_000_000e6); // 1M USDC for testing
        console2.log("Minted 1,000,000 USDC to deployer:", deployer);

        vm.stopBroadcast();

        // ─── Summary ────────────────────────────────────────────────
        console2.log("");
        console2.log("=== DEPLOYMENT COMPLETE ===");
        console2.log("Network:", block.chainid);
        console2.log("");
        console2.log("--- Contract Addresses ---");
        console2.log("MockWorldID:      ", address(mockWorldId));
        console2.log("MockUSDC:         ", address(mockUSDC));
        console2.log("ReputationEngine: ", address(repEngine));
        console2.log("InsurancePool:    ", address(insurancePool));
        console2.log("CircuitBreaker:   ", address(circuitBreaker));
        console2.log("TrustCircle:      ", address(trustCircle));
        console2.log("TrustCircleENS:   ", address(trustCircleENS));
    }
}
