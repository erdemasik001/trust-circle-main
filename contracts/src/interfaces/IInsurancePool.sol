// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IInsurancePool {
    function contribute(uint256 amount) external;
    function claimCoverage(address voucher, uint256 loss) external returns (uint256 covered);
    function payBounty(address liquidator, uint256 outstandingDebt) external returns (uint256 bounty);
    function getBalance() external view returns (uint256);
}
