// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ICircuitBreaker} from "../interfaces/ICircuitBreaker.sol";
import {Constants} from "../libraries/Constants.sol";
import {Errors} from "../libraries/Errors.sol";

/// @title CircuitBreaker — Protocol Health Monitor & Death Spiral Prevention
/// @author Trust Circle — ETHGlobal Cannes 2026
/// @notice Tracks defaults in a rolling 7-day window. Automatically adjusts
///         protocol parameters when default rate exceeds thresholds.
contract CircuitBreaker is ICircuitBreaker {
    address public trustCircle;
    address public owner;

    uint256 public activeLoans;
    uint256 public totalLoansEver;
    uint256 public totalDefaultsEver;

    // Rolling window: store timestamps of defaults in last 7 days
    uint256[] public defaultTimestamps;
    uint256 public windowStart;

    SystemHealth public currentHealth;
    uint256 public healthChangedAt;

    event HealthChanged(SystemHealth oldHealth, SystemHealth newHealth, uint256 defaultRate);
    event LoanRecorded(uint256 activeLoans);
    event DefaultRecorded(uint256 defaultsInWindow, uint256 activeLoans);

    modifier onlyTrustCircle() {
        if (msg.sender != trustCircle) revert Errors.OnlyTrustCircle();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Errors.OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        currentHealth = SystemHealth.GREEN;
        healthChangedAt = block.timestamp;
    }

    function setTrustCircle(address _trustCircle) external onlyOwner {
        if (_trustCircle == address(0)) revert Errors.ZeroAddress();
        trustCircle = _trustCircle;
    }

    function recordLoan() external onlyTrustCircle {
        activeLoans++;
        totalLoansEver++;
        emit LoanRecorded(activeLoans);
    }

    function recordRepayment() external onlyTrustCircle {
        if (activeLoans > 0) activeLoans--;
        _updateHealth();
    }

    function recordDefault() external onlyTrustCircle {
        if (activeLoans > 0) activeLoans--;
        totalDefaultsEver++;
        defaultTimestamps.push(block.timestamp);
        _updateHealth();
        emit DefaultRecorded(_countRecentDefaults(), activeLoans);
    }

    function getHealth() external view returns (SystemHealth) {
        return currentHealth;
    }

    function canCreateLoan() external view returns (bool) {
        return currentHealth != SystemHealth.RED;
    }

    /// @notice Applies Yellow penalty: 50% reduction to max borrow
    function getEffectiveMaxBorrow(uint256 tierMax) external view returns (uint256) {
        if (currentHealth == SystemHealth.YELLOW) {
            return tierMax / 2;
        }
        return tierMax;
    }

    /// @notice Applies Yellow penalty: 50% increase to interest rate
    function getEffectiveRate(uint256 tierRate) external view returns (uint256) {
        if (currentHealth == SystemHealth.YELLOW) {
            return tierRate + (tierRate * Constants.YELLOW_PENALTY_BPS) / Constants.BASIS_POINTS;
        }
        return tierRate;
    }

    function getDefaultRate() external view returns (uint256 rateBps) {
        return _getDefaultRateBps();
    }

    function getStats()
        external
        view
        returns (uint256 _activeLoans, uint256 _totalLoans, uint256 _totalDefaults, uint256 _recentDefaults)
    {
        return (activeLoans, totalLoansEver, totalDefaultsEver, _countRecentDefaults());
    }

    // === Internal ===

    function _updateHealth() internal {
        uint256 rateBps = _getDefaultRateBps();
        SystemHealth newHealth;

        if (rateBps >= Constants.RED_THRESHOLD_BPS) {
            newHealth = SystemHealth.RED;
        } else if (rateBps >= Constants.YELLOW_THRESHOLD_BPS) {
            newHealth = SystemHealth.YELLOW;
        } else if (currentHealth == SystemHealth.RED || currentHealth == SystemHealth.YELLOW) {
            if (rateBps <= Constants.RECOVERY_THRESHOLD_BPS) {
                newHealth = SystemHealth.RECOVERY;
            } else {
                newHealth = currentHealth; // stay in current state
            }
        } else if (currentHealth == SystemHealth.RECOVERY) {
            if (block.timestamp >= healthChangedAt + Constants.RECOVERY_PERIOD) {
                newHealth = SystemHealth.GREEN;
            } else {
                newHealth = SystemHealth.RECOVERY;
            }
        } else {
            newHealth = SystemHealth.GREEN;
        }

        if (newHealth != currentHealth) {
            emit HealthChanged(currentHealth, newHealth, rateBps);
            currentHealth = newHealth;
            healthChangedAt = block.timestamp;
        }
    }

    function _getDefaultRateBps() internal view returns (uint256) {
        uint256 recent = _countRecentDefaults();
        // Default rate = recent defaults / (active loans + recent defaults)
        // Using total denominator to avoid division issues
        uint256 denominator = activeLoans + recent;
        if (denominator == 0) return 0;
        return (recent * Constants.BASIS_POINTS) / denominator;
    }

    function _countRecentDefaults() internal view returns (uint256 count) {
        uint256 cutoff = block.timestamp > Constants.ROLLING_WINDOW ? block.timestamp - Constants.ROLLING_WINDOW : 0;
        // Walk backwards since recent timestamps are at the end
        for (uint256 i = defaultTimestamps.length; i > 0; i--) {
            if (defaultTimestamps[i - 1] >= cutoff) {
                count++;
            } else {
                break;
            }
        }
    }
}
