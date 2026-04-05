// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {CircuitBreaker} from "../src/core/CircuitBreaker.sol";
import {ICircuitBreaker} from "../src/interfaces/ICircuitBreaker.sol";
import {Constants} from "../src/libraries/Constants.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract CircuitBreakerTest is Test {
    CircuitBreaker cb;
    address trustCircle = address(0x7C);

    function setUp() public {
        cb = new CircuitBreaker();
        cb.setTrustCircle(trustCircle);
    }

    // ═══════════════════════════════════════════
    //              INITIAL STATE
    // ═══════════════════════════════════════════

    function test_initialState() public view {
        assertEq(uint256(cb.getHealth()), uint256(ICircuitBreaker.SystemHealth.GREEN));
        assertTrue(cb.canCreateLoan());
        assertEq(cb.activeLoans(), 0);
    }

    // ═══════════════════════════════════════════
    //           LOAN RECORDING
    // ═══════════════════════════════════════════

    function test_recordLoan() public {
        vm.prank(trustCircle);
        cb.recordLoan();
        assertEq(cb.activeLoans(), 1);
        assertEq(cb.totalLoansEver(), 1);
    }

    function test_recordRepayment() public {
        vm.startPrank(trustCircle);
        cb.recordLoan();
        cb.recordLoan();
        cb.recordRepayment();
        vm.stopPrank();
        assertEq(cb.activeLoans(), 1);
    }

    function test_recordRepayment_noUnderflow() public {
        vm.prank(trustCircle);
        cb.recordRepayment(); // active = 0, should not underflow
        assertEq(cb.activeLoans(), 0);
    }

    // ═══════════════════════════════════════════
    //           HEALTH TRANSITIONS
    // ═══════════════════════════════════════════

    function test_staysGreen_lowDefaults() public {
        vm.startPrank(trustCircle);
        // 10 loans, 0 defaults
        for (uint256 i = 0; i < 10; i++) cb.recordLoan();
        vm.stopPrank();

        assertEq(uint256(cb.getHealth()), uint256(ICircuitBreaker.SystemHealth.GREEN));
    }

    function test_turnsYellow_10percentDefaults() public {
        vm.startPrank(trustCircle);
        // 10 loans
        for (uint256 i = 0; i < 10; i++) cb.recordLoan();
        // 1 default out of (9 active + 1 recent default) = 10% → YELLOW
        cb.recordDefault();
        vm.stopPrank();

        assertEq(uint256(cb.getHealth()), uint256(ICircuitBreaker.SystemHealth.YELLOW));
    }

    function test_turnsRed_highDefaults() public {
        vm.startPrank(trustCircle);
        // 5 loans
        for (uint256 i = 0; i < 5; i++) cb.recordLoan();
        // 2 defaults out of (3 active + 2 defaults) = 40% → RED
        cb.recordDefault();
        cb.recordDefault();
        vm.stopPrank();

        assertEq(uint256(cb.getHealth()), uint256(ICircuitBreaker.SystemHealth.RED));
        assertFalse(cb.canCreateLoan());
    }

    function test_recovery_afterDefaultsAge() public {
        vm.startPrank(trustCircle);
        for (uint256 i = 0; i < 10; i++) cb.recordLoan();
        cb.recordDefault(); // triggers YELLOW
        vm.stopPrank();

        // Fast forward past the 7-day rolling window
        vm.warp(block.timestamp + 8 days);

        // Record a repayment to trigger health update
        vm.prank(trustCircle);
        cb.recordRepayment();

        // Defaults aged out, rate is 0% → should be RECOVERY
        uint256 health = uint256(cb.getHealth());
        assertTrue(
            health == uint256(ICircuitBreaker.SystemHealth.RECOVERY)
                || health == uint256(ICircuitBreaker.SystemHealth.GREEN),
            "should be RECOVERY or GREEN after defaults age out"
        );
    }

    // ═══════════════════════════════════════════
    //           EFFECTIVE RATES
    // ═══════════════════════════════════════════

    function test_effectiveMaxBorrow_green() public view {
        assertEq(cb.getEffectiveMaxBorrow(100e6), 100e6);
    }

    function test_effectiveMaxBorrow_yellow() public {
        // Force YELLOW
        vm.startPrank(trustCircle);
        for (uint256 i = 0; i < 10; i++) cb.recordLoan();
        cb.recordDefault();
        vm.stopPrank();

        // Yellow = 50% reduction
        assertEq(cb.getEffectiveMaxBorrow(100e6), 50e6);
    }

    function test_effectiveRate_green() public view {
        assertEq(cb.getEffectiveRate(1500), 1500);
    }

    function test_effectiveRate_yellow() public {
        vm.startPrank(trustCircle);
        for (uint256 i = 0; i < 10; i++) cb.recordLoan();
        cb.recordDefault();
        vm.stopPrank();

        // Yellow = 50% increase: 1500 + 750 = 2250
        assertEq(cb.getEffectiveRate(1500), 2250);
    }

    // ═══════════════════════════════════════════
    //           ACCESS CONTROL
    // ═══════════════════════════════════════════

    function test_onlyTrustCircle() public {
        vm.expectRevert(Errors.OnlyTrustCircle.selector);
        cb.recordLoan();
    }

    // ═══════════════════════════════════════════
    //              STATS
    // ═══════════════════════════════════════════

    function test_getStats() public {
        vm.startPrank(trustCircle);
        cb.recordLoan();
        cb.recordLoan();
        cb.recordLoan();
        cb.recordDefault();
        vm.stopPrank();

        (uint256 active, uint256 total, uint256 defaults, uint256 recent) = cb.getStats();
        assertEq(active, 2);
        assertEq(total, 3);
        assertEq(defaults, 1);
        assertEq(recent, 1);
    }

    function test_getDefaultRate() public {
        vm.startPrank(trustCircle);
        for (uint256 i = 0; i < 9; i++) cb.recordLoan();
        cb.recordDefault(); // 1 default / (8 active + 1 default) = ~11.1%
        vm.stopPrank();

        uint256 rate = cb.getDefaultRate();
        // 1 / 9 * 10000 = 1111 bps (~11.1%)
        assertApproxEqAbs(rate, 1111, 2);
    }
}
