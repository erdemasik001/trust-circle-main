// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ICircuitBreaker {
    enum SystemHealth {
        GREEN,
        YELLOW,
        RED,
        RECOVERY
    }

    function recordLoan() external;
    function recordRepayment() external;
    function recordDefault() external;
    function getHealth() external view returns (SystemHealth);
    function canCreateLoan() external view returns (bool);
    function getEffectiveMaxBorrow(uint256 tierMax) external view returns (uint256);
    function getEffectiveRate(uint256 tierRate) external view returns (uint256);
}
