// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {ReputationEngine} from "../src/core/ReputationEngine.sol";
import {IReputationEngine} from "../src/interfaces/IReputationEngine.sol";
import {Constants} from "../src/libraries/Constants.sol";

contract ReputationEngineTest is Test {
    ReputationEngine engine;

    function setUp() public {
        engine = new ReputationEngine();
    }

    // ═══════════════════════════════════════════
    //              TIER LOOKUP
    // ═══════════════════════════════════════════

    function test_getTier_frozen() public view {
        IReputationEngine.Tier memory t = engine.getTier(0);
        assertEq(t.maxBorrow, 0);
        assertEq(t.interestBps, 0);

        t = engine.getTier(99);
        assertEq(t.maxBorrow, 0, "99 rep should be frozen");
    }

    function test_getTier_newcomer() public view {
        IReputationEngine.Tier memory t = engine.getTier(100);
        assertEq(t.maxBorrow, 100e6);
        assertEq(t.interestBps, 1500);
        assertEq(t.maxDuration, 14 days);
        assertEq(t.minVouchers, 1);
    }

    function test_getTier_rising() public view {
        IReputationEngine.Tier memory t = engine.getTier(200);
        assertEq(t.maxBorrow, 500e6);
        assertEq(t.interestBps, 1200);
        assertEq(t.maxDuration, 21 days);
        assertEq(t.minVouchers, 3);
    }

    function test_getTier_building() public view {
        IReputationEngine.Tier memory t = engine.getTier(300);
        assertEq(t.maxBorrow, 2_000e6);
        assertEq(t.interestBps, 800);

        // 499 should still be building
        t = engine.getTier(499);
        assertEq(t.maxBorrow, 2_000e6);
    }

    function test_getTier_trusted() public view {
        IReputationEngine.Tier memory t = engine.getTier(500);
        assertEq(t.maxBorrow, 10_000e6);
        assertEq(t.interestBps, 500);
    }

    function test_getTier_established() public view {
        IReputationEngine.Tier memory t = engine.getTier(700);
        assertEq(t.maxBorrow, 50_000e6);
        assertEq(t.interestBps, 300);
        assertEq(t.minVouchers, 5);
    }

    function test_getTier_leader() public view {
        IReputationEngine.Tier memory t = engine.getTier(900);
        assertEq(t.maxBorrow, 100_000e6);
        assertEq(t.interestBps, 200);
        assertEq(t.maxDuration, 180 days);

        // Max rep
        t = engine.getTier(1000);
        assertEq(t.maxBorrow, 100_000e6);
    }

    function test_getTierIndex() public view {
        assertEq(engine.getTierIndex(0), 0);
        assertEq(engine.getTierIndex(99), 0);
        assertEq(engine.getTierIndex(100), 1);
        assertEq(engine.getTierIndex(200), 2);
        assertEq(engine.getTierIndex(300), 3);
        assertEq(engine.getTierIndex(500), 4);
        assertEq(engine.getTierIndex(700), 5);
        assertEq(engine.getTierIndex(900), 6);
    }

    function test_getAllTiers_returns7() public view {
        IReputationEngine.Tier[7] memory tiers = engine.getAllTiers();
        assertEq(tiers[0].maxBorrow, 0);
        assertEq(tiers[6].maxBorrow, 100_000e6);
    }

    // ═══════════════════════════════════════════
    //              REP DECAY
    // ═══════════════════════════════════════════

    function test_decay_noDecayWithin90Days() public {
        vm.warp(365 days); // ensure high enough timestamp
        uint256 lastActivity = block.timestamp - 89 days;
        uint256 eff = engine.getEffectiveRep(address(1), 500, lastActivity);
        assertEq(eff, 500);
    }

    function test_decay_startsAfter90Days() public {
        vm.warp(365 days);
        uint256 lastActivity = block.timestamp - 90 days - 30 days; // 1 month past decay start
        uint256 eff = engine.getEffectiveRep(address(1), 500, lastActivity);
        assertEq(eff, 495); // -5 per month
    }

    function test_decay_multipleMonths() public {
        vm.warp(365 days);
        uint256 lastActivity = block.timestamp - 90 days - 90 days; // 3 months past decay start
        uint256 eff = engine.getEffectiveRep(address(1), 500, lastActivity);
        assertEq(eff, 485); // -15 (3 * 5)
    }

    function test_decay_canReachZero() public {
        vm.warp(365 days * 20);
        uint256 lastActivity = block.timestamp - 90 days - 3650 days; // years of inactivity
        uint256 eff = engine.getEffectiveRep(address(1), 100, lastActivity);
        assertEq(eff, 0);
    }

    function test_decay_zeroLastActivity() public view {
        uint256 eff = engine.getEffectiveRep(address(1), 500, 0);
        assertEq(eff, 500, "zero lastActivity = no decay");
    }

    // ═══════════════════════════════════════════
    //           VOUCHER MULTIPLIER
    // ═══════════════════════════════════════════

    function test_multiplier_lowRep() public view {
        assertEq(engine.getVoucherMultiplier(0), 5_000);
        assertEq(engine.getVoucherMultiplier(100), 5_000);
        assertEq(engine.getVoucherMultiplier(199), 5_000);
    }

    function test_multiplier_risingRep() public view {
        assertEq(engine.getVoucherMultiplier(200), 7_500);
        assertEq(engine.getVoucherMultiplier(499), 7_500);
    }

    function test_multiplier_trustedRep() public view {
        assertEq(engine.getVoucherMultiplier(500), 10_000);
        assertEq(engine.getVoucherMultiplier(699), 10_000);
    }

    function test_multiplier_establishedRep() public view {
        assertEq(engine.getVoucherMultiplier(700), 12_500);
        assertEq(engine.getVoucherMultiplier(899), 12_500);
    }

    function test_multiplier_leaderRep() public view {
        assertEq(engine.getVoucherMultiplier(900), 15_000);
        assertEq(engine.getVoucherMultiplier(1000), 15_000);
    }

    // ═══════════════════════════════════════════
    //           ACCOUNT FROZEN CHECK
    // ═══════════════════════════════════════════

    function test_frozen_belowThreshold() public view {
        assertTrue(engine.isAccountFrozen(99, 0));
        assertTrue(engine.isAccountFrozen(0, 0));
    }

    function test_frozen_atThreshold() public view {
        assertFalse(engine.isAccountFrozen(100, 0));
    }

    function test_frozen_inCooldown() public view {
        assertTrue(engine.isAccountFrozen(500, block.timestamp + 1));
    }

    function test_frozen_cooldownExpired() public {
        vm.warp(1000);
        assertFalse(engine.isAccountFrozen(500, 999));
    }

    // ═══════════════════════════════════════════
    //              FUZZ TESTS
    // ═══════════════════════════════════════════

    function testFuzz_tierAlwaysReturns(uint256 rep) public view {
        rep = bound(rep, 0, 1000);
        IReputationEngine.Tier memory t = engine.getTier(rep);
        // Should never revert and tier max borrow should be <= 100K USDC
        assertTrue(t.maxBorrow <= 100_000e6);
    }

    function testFuzz_decayNeverExceedsRep(uint256 rawRep, uint256 inactiveDays) public {
        rawRep = bound(rawRep, 0, 1000);
        inactiveDays = bound(inactiveDays, 0, 3650);
        vm.warp(365 days * 20); // high base timestamp
        uint256 lastActivity = block.timestamp - (inactiveDays * 1 days);
        uint256 eff = engine.getEffectiveRep(address(1), rawRep, lastActivity);
        assertTrue(eff <= rawRep, "effective rep should never exceed raw rep");
    }

    function testFuzz_multiplierInRange(uint256 rep) public view {
        rep = bound(rep, 0, 1000);
        uint256 m = engine.getVoucherMultiplier(rep);
        assertTrue(m >= 5_000 && m <= 15_000);
    }
}
