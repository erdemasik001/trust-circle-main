// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReputationEngine {
    struct Tier {
        uint256 minRep;
        uint256 maxBorrow;
        uint256 interestBps;
        uint256 maxDuration;
        uint256 minVouchers;
    }

    function getTier(uint256 rep) external view returns (Tier memory);
    function getEffectiveRep(address user, uint256 rawRep, uint256 lastActivityAt) external view returns (uint256);
    function getVoucherMultiplier(uint256 voucherRep) external pure returns (uint256);
    function isAccountFrozen(uint256 rep, uint256 cooldownUntil) external view returns (bool);
}
