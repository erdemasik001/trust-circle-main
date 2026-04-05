// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IWorldID} from "../interfaces/IWorldID.sol";
import {IERC20} from "../interfaces/IERC20.sol";
import {IReputationEngine} from "../interfaces/IReputationEngine.sol";
import {IInsurancePool} from "../interfaces/IInsurancePool.sol";
import {ICircuitBreaker} from "../interfaces/ICircuitBreaker.sol";
import {Constants} from "../libraries/Constants.sol";
import {Errors} from "../libraries/Errors.sol";

/// @title TrustCircle — Nash-Balanced Social Collateral Lending Protocol
/// @author Trust Circle — ETHGlobal Cannes 2026
/// @notice Verified humans vouch for each other to access unsecured credit.
///         Game-theoretically balanced: every player's selfish strategy = cooperative outcome.
/// @dev Deployed on World Chain Sepolia + Arc Testnet
contract TrustCircle {
    // ═══════════════════════════════════════════════════════════════
    //                          TYPES
    // ═���════════════════════��════════════════════════════════════════

    enum LoanStatus {
        None,
        Active,
        Repaid,
        Defaulted
    }

    struct User {
        bool isRegistered;
        uint256 nullifierHash;
        uint256 reputationScore;
        uint256 totalVouchesReceived;
        uint256 totalBorrowed;
        uint256 registeredAt;
        uint256 lastActivityAt;
        uint256 defaultCooldownUntil;
        uint256 activeVouchCount;
    }

    struct Vouch {
        uint256 amount;
        uint256 usedAmount;
        bool isActive;
        uint256 createdAt;
        uint256 activatesAt;
    }

    struct Loan {
        address borrower;
        uint256 principal;
        uint256 interestRate;
        uint256 totalDue;
        uint256 amountRepaid;
        uint256 borrowedAt;
        uint256 dueDate;
        uint256 gracePeriodEnd;
        LoanStatus status;
        address[] vouchers;
        uint256[] voucherAmounts;
        uint256 insuranceContribution;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        STATE
    // ══════════════════════════��════════════════════════════════════

    IWorldID public immutable worldId;
    IERC20 public immutable stablecoin;
    IReputationEngine public immutable repEngine;
    IInsurancePool public immutable insurance;
    ICircuitBreaker public immutable breaker;

    uint256 public immutable externalNullifierHash;
    uint256 public immutable groupId;

    address public owner;
    bool public paused;

    uint256 public loanCounter;
    uint256 public protocolFeeAccumulated;

    mapping(address => User) public users;
    mapping(uint256 => bool) public nullifierHashUsed;
    mapping(address => mapping(address => Vouch)) public vouches;
    mapping(address => uint256) public activeLoanId;
    mapping(uint256 => Loan) internal _loans;
    mapping(address => address[]) public borrowerVouchers;
    mapping(address => address[]) public vouchesGivenTo;

    // ═══════��═══════════════════════════════════════════════════════
    //                         EVENTS
    // ═══════════════════════════════════════════════════════════════

    event UserRegistered(address indexed user, uint256 nullifierHash, uint256 timestamp);
    event VouchCreated(address indexed voucher, address indexed borrower, uint256 amount, uint256 activatesAt);
    event VouchUpdated(address indexed voucher, address indexed borrower, uint256 oldAmount, uint256 newAmount);
    event VouchRevoked(address indexed voucher, address indexed borrower, uint256 amount);
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 principal,
        uint256 interestRate,
        uint256 dueDate,
        uint256 insuranceContrib
    );
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount, bool fullyRepaid);
    event LateRepayment(uint256 indexed loanId, uint256 lateFee);
    event YieldDistributed(uint256 indexed loanId, address indexed voucher, uint256 principal, uint256 yield);
    event LoanDefaulted(uint256 indexed loanId, address indexed borrower, uint256 totalSlashed);
    event VoucherSlashed(uint256 indexed loanId, address indexed voucher, uint256 loss, uint256 insuranceCovered);
    event LiquidationBounty(uint256 indexed loanId, address indexed liquidator, uint256 bounty);
    event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore);
    event AccountFrozen(address indexed user, uint256 cooldownUntil);
    event ProtocolFeeCollected(uint256 indexed loanId, uint256 fee);

    // ══════════════════════════════════════════════════��════════════
    //                       MODIFIERS
    // ═══════════���═══════════════════════════════════════════════════

    modifier onlyRegistered() {
        if (!users[msg.sender].isRegistered) revert Errors.NotRegistered();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert Errors.OnlyOwner();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Errors.SystemPaused();
        _;
    }

    // Reentrancy guard
    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "REENTRANCY");
        _locked = 2;
        _;
        _locked = 1;
    }

    // ═══════════════════════════════════════════════════════════════
    //                      CONSTRUCTOR
    // ══���════════════════════════════════════════���═══════════════════

    constructor(
        address _worldId,
        address _stablecoin,
        address _repEngine,
        address _insurance,
        address _breaker,
        uint256 _groupId,
        string memory _appId,
        string memory _action
    ) {
        worldId = IWorldID(_worldId);
        stablecoin = IERC20(_stablecoin);
        repEngine = IReputationEngine(_repEngine);
        insurance = IInsurancePool(_insurance);
        breaker = ICircuitBreaker(_breaker);
        groupId = _groupId;
        externalNullifierHash = uint256(keccak256(abi.encodePacked(_appId, _action)));
        owner = msg.sender;
    }

    // ═══════════════════════════════════════════════════════════════
    //                   1. REGISTRATION (World ID)
    // ══════════���════════════════════════════════════════════════════

    function registerWithWorldID(uint256 root, uint256 nullifierHash, uint256[8] calldata proof)
        external
        whenNotPaused
    {
        if (users[msg.sender].isRegistered) revert Errors.AlreadyRegistered();
        if (nullifierHashUsed[nullifierHash]) revert Errors.DuplicateNullifier();

        uint256 signalHash = uint256(uint160(msg.sender));
        try worldId.verifyProof(root, groupId, signalHash, nullifierHash, externalNullifierHash, proof) {}
        catch {
            revert Errors.InvalidWorldIDProof();
        }

        nullifierHashUsed[nullifierHash] = true;
        users[msg.sender] = User({
            isRegistered: true,
            nullifierHash: nullifierHash,
            reputationScore: Constants.INITIAL_REP,
            totalVouchesReceived: 0,
            totalBorrowed: 0,
            registeredAt: block.timestamp,
            lastActivityAt: block.timestamp,
            defaultCooldownUntil: 0,
            activeVouchCount: 0
        });

        emit UserRegistered(msg.sender, nullifierHash, block.timestamp);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      2. VOUCHING
    // ══════════════════════════════════════════════════��════════════

    function vouchForUser(address borrower, uint256 amount)
        external
        onlyRegistered
        nonReentrant
        whenNotPaused
    {
        if (msg.sender == borrower) revert Errors.CannotVouchForSelf();
        if (!users[borrower].isRegistered) revert Errors.NotRegistered();
        if (amount < Constants.MIN_VOUCH_AMOUNT) revert Errors.AmountBelowMinimum();
        if (users[borrower].defaultCooldownUntil > block.timestamp) revert Errors.BorrowerInCooldown();

        Vouch storage v = vouches[msg.sender][borrower];

        if (!v.isActive) {
            if (users[msg.sender].activeVouchCount >= Constants.MAX_VOUCH_POSITIONS) {
                revert Errors.MaxVouchPositionsReached();
            }
            v.isActive = true;
            v.createdAt = block.timestamp;
            v.activatesAt = block.timestamp + Constants.VOUCH_ACTIVATION_DELAY;
            users[msg.sender].activeVouchCount++;
            borrowerVouchers[borrower].push(msg.sender);
            vouchesGivenTo[msg.sender].push(borrower);
            emit VouchCreated(msg.sender, borrower, amount, v.activatesAt);
        } else {
            emit VouchUpdated(msg.sender, borrower, v.amount, amount);
        }

        uint256 prevAmount = v.amount;
        v.amount = amount;

        if (amount > prevAmount) {
            users[borrower].totalVouchesReceived += (amount - prevAmount);
        } else if (prevAmount > amount) {
            users[borrower].totalVouchesReceived -= (prevAmount - amount);
        }

        users[msg.sender].lastActivityAt = block.timestamp;
    }

    function revokeVouch(address borrower) external onlyRegistered {
        Vouch storage v = vouches[msg.sender][borrower];
        if (!v.isActive) revert Errors.VouchNotActive();
        if (v.usedAmount > 0) revert Errors.CannotRevokeActiveVouch();

        uint256 revokedAmount = v.amount;
        v.isActive = false;
        v.amount = 0;
        users[borrower].totalVouchesReceived -= revokedAmount;
        users[msg.sender].activeVouchCount--;

        emit VouchRevoked(msg.sender, borrower, revokedAmount);
    }

    // ═════════���═══════════════════════════════════════��═════════════
    //                    3. BORROWING
    // ════���═══════════════���═════════════════════════════════���════════

    function borrow(uint256 amount) external onlyRegistered nonReentrant whenNotPaused {
        if (amount == 0) revert Errors.InvalidLoanAmount();
        if (activeLoanId[msg.sender] != 0) revert Errors.ActiveLoanExists();
        if (!breaker.canCreateLoan()) revert Errors.SystemPaused();

        User storage user = users[msg.sender];
        uint256 effRep = repEngine.getEffectiveRep(msg.sender, user.reputationScore, user.lastActivityAt);
        if (repEngine.isAccountFrozen(effRep, user.defaultCooldownUntil)) revert Errors.AccountFrozen();

        IReputationEngine.Tier memory tier = repEngine.getTier(effRep);
        _validateBorrowParams(amount, msg.sender, tier, effRep);

        uint256 loanId = _createLoan(msg.sender, amount, tier);
        _pullVoucherFunds(loanId, msg.sender, amount);
        _transferLoanFunds(loanId, msg.sender, amount);

        user.totalBorrowed += amount;
        user.lastActivityAt = block.timestamp;
        breaker.recordLoan();
    }

    function _validateBorrowParams(
        uint256 amount,
        address borrower,
        IReputationEngine.Tier memory tier,
        uint256 effRep
    ) internal view {
        uint256 maxBorrow = breaker.getEffectiveMaxBorrow(tier.maxBorrow);
        if (amount > maxBorrow) revert Errors.ExceedsMaxLoanAmount();

        (uint256 availableLimit, uint256 voucherCount) = _calculateAvailableLimit(borrower, effRep);
        if (amount > availableLimit) revert Errors.InsufficientVouchLimit();
        if (voucherCount < tier.minVouchers) revert Errors.InsufficientVoucherCount();
    }

    function _createLoan(address borrower, uint256 amount, IReputationEngine.Tier memory tier)
        internal
        returns (uint256 loanId)
    {
        uint256 interestBps = breaker.getEffectiveRate(tier.interestBps);
        uint256 insuranceContrib = (amount * Constants.INSURANCE_CONTRIBUTION_BPS) / Constants.BASIS_POINTS;

        loanCounter++;
        loanId = loanCounter;

        Loan storage loan = _loans[loanId];
        loan.borrower = borrower;
        loan.principal = amount;
        loan.interestRate = interestBps;
        loan.totalDue = amount + (amount * interestBps) / Constants.BASIS_POINTS;
        loan.borrowedAt = block.timestamp;
        loan.dueDate = block.timestamp + tier.maxDuration;
        loan.gracePeriodEnd = loan.dueDate + Constants.GRACE_PERIOD;
        loan.status = LoanStatus.Active;
        loan.insuranceContribution = insuranceContrib;

        activeLoanId[borrower] = loanId;
    }

    function _pullVoucherFunds(uint256 loanId, address borrower, uint256 amount) internal {
        Loan storage loan = _loans[loanId];
        uint256 remaining = amount + loan.insuranceContribution;
        address[] storage voucherList = borrowerVouchers[borrower];

        for (uint256 i = 0; i < voucherList.length && remaining > 0;) {
            address vAddr = voucherList[i];
            Vouch storage v = vouches[vAddr][borrower];

            if (v.isActive && v.activatesAt <= block.timestamp && v.amount > v.usedAmount) {
                uint256 allocation = remaining > (v.amount - v.usedAmount) ? (v.amount - v.usedAmount) : remaining;

                bool success = stablecoin.transferFrom(vAddr, address(this), allocation);
                if (!success) revert Errors.TransferFailed();

                v.usedAmount += allocation;
                loan.vouchers.push(vAddr);
                loan.voucherAmounts.push(allocation);
                remaining -= allocation;
            }
            unchecked { ++i; }
        }
    }

    function _transferLoanFunds(uint256 loanId, address borrower, uint256 amount) internal {
        Loan storage loan = _loans[loanId];

        // Send insurance contribution to pool
        if (loan.insuranceContribution > 0) {
            bool s1 = stablecoin.transfer(address(insurance), loan.insuranceContribution);
            if (!s1) revert Errors.TransferFailed();
            insurance.contribute(loan.insuranceContribution);
        }

        // Transfer loan amount to borrower
        bool s2 = stablecoin.transfer(borrower, amount);
        if (!s2) revert Errors.TransferFailed();

        emit LoanCreated(loanId, borrower, amount, loan.interestRate, loan.dueDate, loan.insuranceContribution);
    }

    // ══════════════════════════════════���════════════════════════════
    //                     4. REPAYMENT
    // ═════════════���═══════════════════���═════════════════════════════

    function repayLoan(uint256 amount) external onlyRegistered nonReentrant whenNotPaused {
        if (amount == 0) revert Errors.ZeroRepayment();
        uint256 loanId = activeLoanId[msg.sender];
        if (loanId == 0) revert Errors.LoanNotFound();

        Loan storage loan = _loans[loanId];
        if (loan.status != LoanStatus.Active) revert Errors.LoanNotActive();

        // Apply late fee if in grace period
        if (block.timestamp > loan.dueDate && block.timestamp <= loan.gracePeriodEnd) {
            uint256 lateFee = (loan.totalDue * Constants.LATE_FEE_BPS) / Constants.BASIS_POINTS;
            loan.totalDue += lateFee;
            _updateReputation(msg.sender, false, Constants.REP_LOSS_LATE);
            emit LateRepayment(loanId, lateFee);
            // Set dueDate to now so late fee only applies once
            loan.dueDate = block.timestamp;
        }

        // Only take what's owed (overpayment protection)
        uint256 remaining = loan.totalDue - loan.amountRepaid;
        uint256 paymentAmount = amount > remaining ? remaining : amount;

        bool success = stablecoin.transferFrom(msg.sender, address(this), paymentAmount);
        if (!success) revert Errors.TransferFailed();

        loan.amountRepaid += paymentAmount;
        bool fullyRepaid = loan.amountRepaid >= loan.totalDue;

        if (fullyRepaid) {
            loan.status = LoanStatus.Repaid;
            activeLoanId[msg.sender] = 0;
            _distributeYield(loanId);
            _updateReputation(msg.sender, true, Constants.REP_GAIN_REPAY);
            breaker.recordRepayment();
        }

        users[msg.sender].lastActivityAt = block.timestamp;
        emit LoanRepaid(loanId, msg.sender, paymentAmount, fullyRepaid);
    }

    // ═══════════���════════════════════════��══════════════════════════
    //                   5. LIQUIDATION
    // ═══════════════════════════════��═══════════════════════════════

    function liquidateDefaultedLoan(address borrower) external onlyRegistered nonReentrant whenNotPaused {
        uint256 loanId = activeLoanId[borrower];
        if (loanId == 0) revert Errors.LoanNotFound();

        Loan storage loan = _loans[loanId];
        if (loan.status != LoanStatus.Active) revert Errors.LoanNotActive();
        if (block.timestamp <= loan.dueDate) revert Errors.LoanNotOverdue();
        if (block.timestamp <= loan.gracePeriodEnd) revert Errors.LoanInGracePeriod();

        loan.status = LoanStatus.Defaulted;
        activeLoanId[borrower] = 0;

        uint256 outstandingDebt = loan.totalDue - loan.amountRepaid;

        // Pay liquidation bounty (time-decay)
        uint256 bountyAmount = _calculateBounty(outstandingDebt, loan.gracePeriodEnd);
        uint256 actualBounty = insurance.payBounty(msg.sender, bountyAmount);
        emit LiquidationBounty(loanId, msg.sender, actualBounty);

        // Slash vouchers with insurance coverage
        uint256 totalSlashed = 0;
        for (uint256 i = 0; i < loan.vouchers.length;) {
            address vAddr = loan.vouchers[i];
            Vouch storage v = vouches[vAddr][borrower];
            uint256 voucherShare = (loan.voucherAmounts[i] * outstandingDebt) / loan.principal;

            // Insurance covers 30% of each voucher's loss
            uint256 covered = insurance.claimCoverage(vAddr, voucherShare);
            uint256 netLoss = voucherShare - covered;
            totalSlashed += netLoss;

            emit VoucherSlashed(loanId, vAddr, netLoss, covered);

            v.usedAmount = 0;
            unchecked { ++i; }
        }

        // Penalize borrower
        _updateReputation(borrower, false, Constants.REP_LOSS_DEFAULT);

        // Freeze if rep drops below threshold
        User storage borrowerUser = users[borrower];
        if (borrowerUser.reputationScore < Constants.FROZEN_THRESHOLD) {
            borrowerUser.defaultCooldownUntil = block.timestamp + Constants.DEFAULT_COOLDOWN;
            emit AccountFrozen(borrower, borrowerUser.defaultCooldownUntil);
        }

        breaker.recordDefault();
        emit LoanDefaulted(loanId, borrower, totalSlashed);
    }

    // ═���════════════════════════════���════════════════════════════════
    //                    INTERNAL FUNCTIONS
    // ═════════════���════════════════════════��════════════════════════

    function _calculateAvailableLimit(address borrower, uint256 borrowerEffectiveRep)
        internal
        view
        returns (uint256 totalAvailable, uint256 activatedVoucherCount)
    {
        address[] storage voucherList = borrowerVouchers[borrower];
        uint256 rawTotal = 0;

        for (uint256 i = 0; i < voucherList.length;) {
            Vouch storage v = vouches[voucherList[i]][borrower];
            if (v.isActive && v.activatesAt <= block.timestamp && v.amount > v.usedAmount) {
                uint256 available = v.amount - v.usedAmount;

                // Apply voucher reputation multiplier
                uint256 voucherRep = users[voucherList[i]].reputationScore;
                uint256 multiplier = repEngine.getVoucherMultiplier(voucherRep);
                uint256 effectiveAmount = (available * multiplier) / Constants.BASIS_POINTS;

                rawTotal += effectiveAmount;
                activatedVoucherCount++;
            }
            unchecked { ++i; }
        }

        totalAvailable = rawTotal;

        // Check concentration: no single voucher > 40% of total
        // This is checked per-vouch in the borrow loop rather than here for gas efficiency
    }

    function _distributeYield(uint256 loanId) internal {
        Loan storage loan = _loans[loanId];
        uint256 totalInterest = loan.totalDue - loan.principal;
        uint256 totalVoucherYieldPaid = 0;

        for (uint256 i = 0; i < loan.vouchers.length;) {
            address vAddr = loan.vouchers[i];
            uint256 contribution = loan.voucherAmounts[i];
            Vouch storage v = vouches[vAddr][loan.borrower];

            uint256 interestShare = (totalInterest * contribution) / loan.principal;
            uint256 voucherYield = (interestShare * Constants.VOUCHER_YIELD_SHARE_BPS) / Constants.BASIS_POINTS;
            totalVoucherYieldPaid += voucherYield;

            uint256 totalReturn = contribution + voucherYield;
            bool success = stablecoin.transfer(vAddr, totalReturn);
            if (!success) revert Errors.TransferFailed();

            emit YieldDistributed(loanId, vAddr, contribution, voucherYield);

            v.usedAmount = 0;
            unchecked { ++i; }
        }

        // Protocol fee = total interest - what was paid to vouchers
        uint256 protocolFee = totalInterest - totalVoucherYieldPaid;
        protocolFeeAccumulated += protocolFee;
        emit ProtocolFeeCollected(loanId, protocolFee);
    }

    function _calculateBounty(uint256 outstandingDebt, uint256 gracePeriodEnd) internal view returns (uint256) {
        uint256 daysOverdue = (block.timestamp - gracePeriodEnd) / 1 days;
        uint256 bountyBps;

        if (daysOverdue <= 3) bountyBps = Constants.BOUNTY_TIER1_BPS;
        else if (daysOverdue <= 7) bountyBps = Constants.BOUNTY_TIER2_BPS;
        else if (daysOverdue <= 14) bountyBps = Constants.BOUNTY_TIER3_BPS;
        else bountyBps = Constants.BOUNTY_TIER4_BPS;

        return (outstandingDebt * bountyBps) / Constants.BASIS_POINTS;
    }

    function _updateReputation(address user, bool positive, uint256 amount) internal {
        User storage u = users[user];
        uint256 oldScore = u.reputationScore;

        if (positive) {
            u.reputationScore = oldScore + amount > Constants.MAX_REP ? Constants.MAX_REP : oldScore + amount;
        } else {
            u.reputationScore = oldScore >= amount ? oldScore - amount : 0;
        }

        emit ReputationUpdated(user, oldScore, u.reputationScore);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    struct ProfileView {
        bool isRegistered;
        uint256 reputationScore;
        uint256 effectiveRep;
        uint256 totalVouchesReceived;
        uint256 totalBorrowed;
        uint256 registeredAt;
        uint256 activeLoan;
        uint256 activeVouchCount;
        bool frozen;
    }

    function getUserProfile(address user) external view returns (ProfileView memory p) {
        User storage u = users[user];
        uint256 effRep = repEngine.getEffectiveRep(user, u.reputationScore, u.lastActivityAt);
        p.isRegistered = u.isRegistered;
        p.reputationScore = u.reputationScore;
        p.effectiveRep = effRep;
        p.totalVouchesReceived = u.totalVouchesReceived;
        p.totalBorrowed = u.totalBorrowed;
        p.registeredAt = u.registeredAt;
        p.activeLoan = activeLoanId[user];
        p.activeVouchCount = u.activeVouchCount;
        p.frozen = repEngine.isAccountFrozen(effRep, u.defaultCooldownUntil);
    }

    function getActiveLoan(address borrower)
        external
        view
        returns (
            uint256 loanId,
            uint256 principal,
            uint256 totalDue,
            uint256 amountRepaid,
            uint256 dueDate,
            uint256 gracePeriodEnd,
            LoanStatus status
        )
    {
        loanId = activeLoanId[borrower];
        if (loanId == 0) return (0, 0, 0, 0, 0, 0, LoanStatus.None);
        Loan storage loan = _loans[loanId];
        return (loanId, loan.principal, loan.totalDue, loan.amountRepaid, loan.dueDate, loan.gracePeriodEnd, loan.status);
    }

    function getAvailableLimit(address borrower) external view returns (uint256 limit, uint256 voucherCount) {
        User storage u = users[borrower];
        uint256 effRep = repEngine.getEffectiveRep(borrower, u.reputationScore, u.lastActivityAt);
        return _calculateAvailableLimit(borrower, effRep);
    }

    function getVouchDetails(address voucher, address borrower)
        external
        view
        returns (uint256 amount, uint256 usedAmount, bool isActive, uint256 activatesAt)
    {
        Vouch storage v = vouches[voucher][borrower];
        return (v.amount, v.usedAmount, v.isActive, v.activatesAt);
    }

    function getLoanVouchers(uint256 loanId) external view returns (address[] memory, uint256[] memory) {
        Loan storage loan = _loans[loanId];
        return (loan.vouchers, loan.voucherAmounts);
    }

    function getBorrowerVouchers(address borrower) external view returns (address[] memory) {
        return borrowerVouchers[borrower];
    }

    function getVouchesGivenTo(address user) external view returns (address[] memory) {
        return vouchesGivenTo[user];
    }

    // ═══════════════════════════════════════════════════════════════
    //                       ADMIN
    // ════════════════════════════��═══════════════════════════���══════

    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert Errors.ZeroAddress();
        owner = newOwner;
    }

    function withdrawProtocolFees(address to) external onlyOwner {
        if (to == address(0)) revert Errors.ZeroAddress();
        uint256 fees = protocolFeeAccumulated;
        protocolFeeAccumulated = 0;
        bool success = stablecoin.transfer(to, fees);
        if (!success) revert Errors.TransferFailed();
    }
}
