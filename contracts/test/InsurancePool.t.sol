// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {InsurancePool} from "../src/core/InsurancePool.sol";
import {MockERC20} from "../src/mocks/MockERC20.sol";
import {Errors} from "../src/libraries/Errors.sol";

contract InsurancePoolTest is Test {
    InsurancePool pool;
    MockERC20 usdc;

    address trustCircle = address(0x7C);
    address voucher1 = address(0x71);
    address liquidator1 = address(0x81);

    function setUp() public {
        usdc = new MockERC20("USDC", "USDC");
        pool = new InsurancePool(address(usdc));
        pool.setTrustCircle(trustCircle);

        // Fund the pool contract with USDC (simulating contributions)
        usdc.mint(address(pool), 10_000e6);
    }

    // ═══════════════════════════════════════════
    //              ACCESS CONTROL
    // ═══════════════════════════════════════════

    function test_onlyTrustCircle_contribute() public {
        vm.expectRevert(Errors.OnlyTrustCircle.selector);
        pool.contribute(100e6);
    }

    function test_onlyTrustCircle_claimCoverage() public {
        vm.expectRevert(Errors.OnlyTrustCircle.selector);
        pool.claimCoverage(voucher1, 100e6);
    }

    function test_onlyTrustCircle_payBounty() public {
        vm.expectRevert(Errors.OnlyTrustCircle.selector);
        pool.payBounty(liquidator1, 100e6);
    }

    function test_onlyOwner_setTrustCircle() public {
        vm.prank(address(0xBAD));
        vm.expectRevert(Errors.OnlyOwner.selector);
        pool.setTrustCircle(address(1));
    }

    function test_setTrustCircle_zeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        pool.setTrustCircle(address(0));
    }

    // ═══════════════════════════════════════════
    //              CONTRIBUTIONS
    // ═══════════════════════════════════════════

    function test_contribute() public {
        vm.prank(trustCircle);
        pool.contribute(500e6);
        assertEq(pool.poolBalance(), 500e6);
        assertEq(pool.totalContributions(), 500e6);
    }

    function test_contribute_accumulates() public {
        vm.startPrank(trustCircle);
        pool.contribute(100e6);
        pool.contribute(200e6);
        vm.stopPrank();
        assertEq(pool.poolBalance(), 300e6);
        assertEq(pool.totalContributions(), 300e6);
    }

    // ═══════════════════════════════════════════
    //           COVERAGE PAYOUTS
    // ═══════════════════════════════════════════

    function test_claimCoverage_30percent() public {
        vm.prank(trustCircle);
        pool.contribute(1_000e6);

        vm.prank(trustCircle);
        uint256 covered = pool.claimCoverage(voucher1, 1_000e6);

        // 30% of 1000 = 300
        assertEq(covered, 300e6);
        assertEq(usdc.balanceOf(voucher1), 300e6);
        assertEq(pool.poolBalance(), 700e6);
        assertEq(pool.totalCoveragePaid(), 300e6);
    }

    function test_claimCoverage_cappedByPoolBalance() public {
        vm.prank(trustCircle);
        pool.contribute(100e6);

        vm.prank(trustCircle);
        uint256 covered = pool.claimCoverage(voucher1, 1_000e6);

        // 30% of 1000 = 300, but pool only has 100
        assertEq(covered, 100e6);
        assertEq(pool.poolBalance(), 0);
    }

    function test_claimCoverage_emptyPool() public {
        // No contributions
        vm.prank(trustCircle);
        uint256 covered = pool.claimCoverage(voucher1, 1_000e6);
        assertEq(covered, 0);
    }

    // ═══════════════════════════════════════════
    //           BOUNTY PAYOUTS
    // ═══════════════════════════════════════════

    function test_payBounty() public {
        vm.prank(trustCircle);
        pool.contribute(500e6);

        vm.prank(trustCircle);
        uint256 bounty = pool.payBounty(liquidator1, 10e6);

        assertEq(bounty, 10e6);
        assertEq(usdc.balanceOf(liquidator1), 10e6);
        assertEq(pool.poolBalance(), 490e6);
        assertEq(pool.totalBountiesPaid(), 10e6);
    }

    function test_payBounty_cappedByBalance() public {
        vm.prank(trustCircle);
        pool.contribute(5e6);

        vm.prank(trustCircle);
        uint256 bounty = pool.payBounty(liquidator1, 100e6);

        assertEq(bounty, 5e6);
        assertEq(pool.poolBalance(), 0);
    }

    // ═══════════════════════════════════════════
    //              STATS VIEW
    // ═══════════════════════════════════════════

    function test_getStats() public {
        vm.startPrank(trustCircle);
        pool.contribute(1_000e6);
        pool.claimCoverage(voucher1, 500e6); // 150 covered
        pool.payBounty(liquidator1, 20e6);
        vm.stopPrank();

        (uint256 bal, uint256 contribs, uint256 coverage, uint256 bounties) = pool.getStats();
        assertEq(contribs, 1_000e6);
        assertEq(coverage, 150e6);
        assertEq(bounties, 20e6);
        assertEq(bal, 1_000e6 - 150e6 - 20e6);
    }

    // ═══════════════════════════════════════════
    //              FUZZ
    // ═══════════════════════════════════════════

    function testFuzz_coverageNeverExceedsPool(uint256 loss, uint256 poolAmt) public {
        poolAmt = bound(poolAmt, 0, 1_000_000e6);
        loss = bound(loss, 0, 1_000_000e6);

        // Fresh pool
        InsurancePool p = new InsurancePool(address(usdc));
        p.setTrustCircle(trustCircle);
        usdc.mint(address(p), poolAmt);

        vm.prank(trustCircle);
        p.contribute(poolAmt);

        vm.prank(trustCircle);
        uint256 covered = p.claimCoverage(voucher1, loss);

        assertTrue(covered <= poolAmt, "covered should not exceed pool");
        assertTrue(covered <= (loss * 3000) / 10_000, "covered should not exceed 30% of loss");
    }
}
