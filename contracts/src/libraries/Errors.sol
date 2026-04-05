// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Trust Circle — Shared Error Definitions
library Errors {
    // === Identity ===
    error AlreadyRegistered();
    error NotRegistered();
    error DuplicateNullifier();
    error InvalidWorldIDProof();

    // === Vouching ===
    error CannotVouchForSelf();
    error AmountBelowMinimum();
    error VouchNotActive();
    error VouchNotActivated();
    error MaxVouchPositionsReached();
    error ConcentrationTooHigh();
    error CannotRevokeActiveVouch();
    error BorrowerInCooldown();

    // === Borrowing ===
    error AccountFrozen();
    error InsufficientVouchLimit();
    error ActiveLoanExists();
    error InvalidLoanAmount();
    error ExceedsMaxLoanAmount();
    error InsufficientVoucherCount();
    error SystemPaused();

    // === Repayment ===
    error LoanNotFound();
    error LoanNotActive();
    error ZeroRepayment();

    // === Liquidation ===
    error LoanNotOverdue();
    error LoanInGracePeriod();

    // === Transfers ===
    error TransferFailed();

    // === Admin ===
    error OnlyOwner();
    error OnlyTrustCircle();
    error ZeroAddress();
    error InvalidParameter();
}
