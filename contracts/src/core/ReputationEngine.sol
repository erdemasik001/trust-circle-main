// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IReputationEngine} from "../interfaces/IReputationEngine.sol";
import {Constants} from "../libraries/Constants.sol";

/// @title ReputationEngine — Tier System, Decay & Voucher Multiplier
/// @author Trust Circle — ETHGlobal Cannes 2026
/// @notice Pure logic contract. No state — TrustCircle stores all user data.
///         This contract only computes tier lookups, decay, and multipliers.
contract ReputationEngine is IReputationEngine {
    // 7 tiers: Frozen(0), Newcomer(1), Rising(2), Building(3), Trusted(4), Established(5), Leader(6)
    Tier[7] private _tiers;

    constructor() {
        //                    minRep  maxBorrow       interestBps  maxDuration   minVouchers
        _tiers[0] = Tier(0,   0,              0,           0,            0); // Frozen
        _tiers[1] = Tier(100, 100e6,          1500,        14 days,      1); // Newcomer
        _tiers[2] = Tier(200, 500e6,          1200,        21 days,      3); // Rising
        _tiers[3] = Tier(300, 2_000e6,        800,         30 days,      3); // Building
        _tiers[4] = Tier(500, 10_000e6,       500,         60 days,      3); // Trusted
        _tiers[5] = Tier(700, 50_000e6,       300,         90 days,      5); // Established
        _tiers[6] = Tier(900, 100_000e6,      200,         180 days,     5); // Leader
    }

    /// @notice Returns the tier for a given reputation score (highest matching tier)
    function getTier(uint256 rep) external view returns (Tier memory) {
        // Walk backwards from highest tier
        for (uint256 i = 6; i > 0; i--) {
            if (rep >= _tiers[i].minRep) {
                return _tiers[i];
            }
        }
        return _tiers[0]; // Frozen
    }

    /// @notice Returns the tier index (0-6) for a given rep
    function getTierIndex(uint256 rep) external view returns (uint256) {
        for (uint256 i = 6; i > 0; i--) {
            if (rep >= _tiers[i].minRep) return i;
        }
        return 0;
    }

    /// @notice Applies time-based decay to raw reputation
    /// @param rawRep The stored reputation score
    /// @param lastActivityAt Timestamp of last user activity
    /// @return Effective reputation after decay
    function getEffectiveRep(address, uint256 rawRep, uint256 lastActivityAt) external view returns (uint256) {
        if (lastActivityAt == 0 || block.timestamp < lastActivityAt || block.timestamp <= lastActivityAt + Constants.REP_DECAY_START) {
            return rawRep;
        }

        uint256 inactiveTime = block.timestamp - lastActivityAt - Constants.REP_DECAY_START;
        uint256 monthsInactive = inactiveTime / 30 days;
        uint256 decay = monthsInactive * Constants.REP_DECAY_RATE;

        if (decay >= rawRep) return 0;
        return rawRep - decay;
    }

    /// @notice Voucher reputation multiplier in basis points
    ///         Rep 0-199: 5000 (0.5x), Rep 200-499: 7500 (0.75x), Rep 500-699: 10000 (1.0x)
    ///         Rep 700-899: 12500 (1.25x), Rep 900+: 15000 (1.5x)
    function getVoucherMultiplier(uint256 voucherRep) external pure returns (uint256) {
        if (voucherRep >= 900) return 15_000;
        if (voucherRep >= 700) return 12_500;
        if (voucherRep >= 500) return 10_000;
        if (voucherRep >= 200) return 7_500;
        return 5_000;
    }

    /// @notice Check if account is frozen (rep below threshold or in cooldown)
    function isAccountFrozen(uint256 rep, uint256 cooldownUntil) external view returns (bool) {
        return rep < Constants.FROZEN_THRESHOLD || block.timestamp < cooldownUntil;
    }

    /// @notice Get all tier data (for frontend)
    function getAllTiers() external view returns (Tier[7] memory) {
        return _tiers;
    }
}
