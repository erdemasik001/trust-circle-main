// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Trust Circle — Protocol Constants (Nash-Balanced)
library Constants {
    uint256 internal constant BASIS_POINTS = 10_000;

    // === Reputation ===
    uint256 internal constant INITIAL_REP = 100;
    uint256 internal constant MAX_REP = 1_000;
    uint256 internal constant REP_GAIN_REPAY = 10;
    uint256 internal constant REP_LOSS_DEFAULT = 50;
    uint256 internal constant REP_LOSS_LATE = 10;
    uint256 internal constant REP_DECAY_RATE = 5; // per month
    uint256 internal constant REP_DECAY_START = 90 days;
    uint256 internal constant FROZEN_THRESHOLD = 100;

    // === Vouching ===
    uint256 internal constant MIN_VOUCH_AMOUNT = 10e6; // 10 USDC
    uint256 internal constant VOUCH_ACTIVATION_DELAY = 48 hours;
    uint256 internal constant MAX_VOUCH_POSITIONS = 5;
    uint256 internal constant MAX_CONCENTRATION_BPS = 4_000; // 40%

    // === Loans ===
    uint256 internal constant GRACE_PERIOD = 7 days;
    uint256 internal constant LATE_FEE_BPS = 200; // 2%
    uint256 internal constant DEFAULT_COOLDOWN = 30 days;

    // === Insurance ===
    uint256 internal constant INSURANCE_CONTRIBUTION_BPS = 100; // 1% of principal
    uint256 internal constant INSURANCE_COVERAGE_BPS = 3_000; // 30% of loss
    uint256 internal constant VOUCHER_YIELD_SHARE_BPS = 8_000; // 80%

    // === Liquidation Bounty (time-decay) ===
    uint256 internal constant BOUNTY_TIER1_BPS = 100; // 1% (day 1-3)
    uint256 internal constant BOUNTY_TIER2_BPS = 200; // 2% (day 4-7)
    uint256 internal constant BOUNTY_TIER3_BPS = 300; // 3% (day 8-14)
    uint256 internal constant BOUNTY_TIER4_BPS = 500; // 5% (day 15+)

    // === Circuit Breaker ===
    uint256 internal constant YELLOW_THRESHOLD_BPS = 1_000; // 10% default rate
    uint256 internal constant RED_THRESHOLD_BPS = 2_000; // 20% default rate
    uint256 internal constant RECOVERY_THRESHOLD_BPS = 500; // 5% default rate
    uint256 internal constant YELLOW_PENALTY_BPS = 5_000; // 50% stricter limits
    uint256 internal constant ROLLING_WINDOW = 7 days;
    uint256 internal constant RECOVERY_PERIOD = 14 days;
}
