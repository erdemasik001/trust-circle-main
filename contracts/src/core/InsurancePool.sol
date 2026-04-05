// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IInsurancePool} from "../interfaces/IInsurancePool.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {Constants} from "../libraries/Constants.sol";
import {Errors} from "../libraries/Errors.sol";

/// @title InsurancePool — Voucher Loss Protection & Liquidation Bounties
/// @author Trust Circle — ETHGlobal Cannes 2026
/// @notice Funded by 1% of every loan principal. Covers 30% of voucher losses.
///         Pays time-decay liquidation bounties (1-5%).
contract InsurancePool is IInsurancePool {
    IERC20 public immutable stablecoin;
    address public trustCircle;
    address public owner;

    uint256 public poolBalance;
    uint256 public totalContributions;
    uint256 public totalCoveragePaid;
    uint256 public totalBountiesPaid;

    event Contributed(uint256 amount, uint256 newBalance);
    event CoveragePaid(address indexed voucher, uint256 loss, uint256 covered);
    event BountyPaid(address indexed liquidator, uint256 bounty);

    modifier onlyTrustCircle() {
        if (msg.sender != trustCircle) revert Errors.OnlyTrustCircle();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Errors.OnlyOwner();
        _;
    }

    constructor(address _stablecoin) {
        stablecoin = IERC20(_stablecoin);
        owner = msg.sender;
    }

    function setTrustCircle(address _trustCircle) external onlyOwner {
        if (_trustCircle == address(0)) revert Errors.ZeroAddress();
        trustCircle = _trustCircle;
    }

    /// @notice Called by TrustCircle on every borrow. Tokens already transferred to this contract.
    function contribute(uint256 amount) external onlyTrustCircle {
        poolBalance += amount;
        totalContributions += amount;
        emit Contributed(amount, poolBalance);
    }

    /// @notice Covers up to 30% of a voucher's loss on default.
    ///         Transfers coverage directly to voucher. Called per-voucher during liquidation.
    /// @return covered Actual amount covered (may be less if pool is low)
    function claimCoverage(address voucher, uint256 loss) external onlyTrustCircle returns (uint256 covered) {
        covered = (loss * Constants.INSURANCE_COVERAGE_BPS) / Constants.BASIS_POINTS;
        if (covered > poolBalance) {
            covered = poolBalance;
        }
        if (covered == 0) return 0;

        poolBalance -= covered;
        totalCoveragePaid += covered;

        bool success = stablecoin.transfer(voucher, covered);
        if (!success) revert Errors.TransferFailed();

        emit CoveragePaid(voucher, loss, covered);
    }

    /// @notice Pays time-decay bounty to liquidator. Called during liquidation.
    /// @param liquidator Address to receive bounty
    /// @param outstandingDebt Total remaining debt of the defaulted loan
    /// @return bounty Actual bounty paid
    function payBounty(address liquidator, uint256 outstandingDebt) external onlyTrustCircle returns (uint256 bounty) {
        // Bounty is calculated by TrustCircle based on days overdue, passed as outstandingDebt-based calc
        // Here we just pay what's requested up to pool balance
        // The bounty BPS is determined by the caller (TrustCircle) based on time
        bounty = outstandingDebt; // TrustCircle passes the pre-calculated bounty amount
        if (bounty > poolBalance) {
            bounty = poolBalance;
        }
        if (bounty == 0) return 0;

        poolBalance -= bounty;
        totalBountiesPaid += bounty;

        bool success = stablecoin.transfer(liquidator, bounty);
        if (!success) revert Errors.TransferFailed();

        emit BountyPaid(liquidator, bounty);
    }

    function getBalance() external view returns (uint256) {
        return poolBalance;
    }

    function getStats()
        external
        view
        returns (uint256 balance, uint256 contributions, uint256 coveragePaid, uint256 bountiesPaid)
    {
        return (poolBalance, totalContributions, totalCoveragePaid, totalBountiesPaid);
    }
}
