// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Errors} from "../libraries/Errors.sol";

/// @title TrustCircleENS — L2 Subname Registry & Credit Identity
/// @author Trust Circle — ETHGlobal Cannes 2026
/// @notice Provides human-readable identity (alice.trustcircle.eth) on L2.
///         Stores credit profile data in text records for cross-dApp discoverability.
contract TrustCircleENS {
    struct SubnameRecord {
        address owner;
        uint256 registeredAt;
        bool exists;
    }

    struct UserProfile {
        string subname;
        string mainnetENS;
        bool hasSubname;
        mapping(string => string) textRecords;
    }

    string public constant PARENT_NAME = "trustcircle.eth";

    address public trustCircle;
    address public owner;

    mapping(string => SubnameRecord) public subnames;
    mapping(address => UserProfile) internal _profiles;
    mapping(address => string) public reverseRecords;

    event SubnameClaimed(address indexed owner, string subname, string fullName, uint256 timestamp);
    event SubnameTransferred(string subname, address indexed from, address indexed to);
    event MainnetENSLinked(address indexed user, string ensName);
    event TextRecordSet(address indexed user, string key, string value);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Errors.OnlyOwner();
        _;
    }

    modifier onlyTrustCircleUser() {
        // In production, check TrustCircle.isUserRegistered(msg.sender)
        // For hackathon, trust that TrustCircle address is set
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setTrustCircle(address _trustCircle) external onlyOwner {
        if (_trustCircle == address(0)) revert Errors.ZeroAddress();
        trustCircle = _trustCircle;
    }

    function claimSubname(string calldata name) external onlyTrustCircleUser {
        _validateSubname(name);
        require(!subnames[name].exists, "ENS: name taken");
        require(!_profiles[msg.sender].hasSubname, "ENS: already claimed");

        subnames[name] = SubnameRecord({owner: msg.sender, registeredAt: block.timestamp, exists: true});

        UserProfile storage profile = _profiles[msg.sender];
        profile.subname = name;
        profile.hasSubname = true;

        string memory fullName = string(abi.encodePacked(name, ".", PARENT_NAME));
        reverseRecords[msg.sender] = fullName;

        emit SubnameClaimed(msg.sender, name, fullName, block.timestamp);
    }

    function transferSubname(address to) external {
        UserProfile storage fromProfile = _profiles[msg.sender];
        require(fromProfile.hasSubname, "ENS: no subname");
        require(!_profiles[to].hasSubname, "ENS: recipient has subname");

        string memory name = fromProfile.subname;
        SubnameRecord storage record = subnames[name];

        fromProfile.subname = "";
        fromProfile.hasSubname = false;
        fromProfile.mainnetENS = "";
        delete reverseRecords[msg.sender];

        record.owner = to;
        UserProfile storage toProfile = _profiles[to];
        toProfile.subname = name;
        toProfile.hasSubname = true;

        string memory fullName = string(abi.encodePacked(name, ".", PARENT_NAME));
        reverseRecords[to] = fullName;

        emit SubnameTransferred(name, msg.sender, to);
    }

    function linkMainnetENS(string calldata ensName) external onlyTrustCircleUser {
        _profiles[msg.sender].mainnetENS = ensName;
        emit MainnetENSLinked(msg.sender, ensName);
    }

    /// @notice Set a text record (for credit profile data)
    function setTextRecord(string calldata key, string calldata value) external {
        require(_profiles[msg.sender].hasSubname, "ENS: no subname");
        _profiles[msg.sender].textRecords[key] = value;
        emit TextRecordSet(msg.sender, key, value);
    }

    // === View Functions ===

    function resolve(string calldata name) external view returns (address) {
        SubnameRecord storage record = subnames[name];
        require(record.exists, "ENS: not found");
        return record.owner;
    }

    function reverseResolve(address addr) external view returns (string memory) {
        return reverseRecords[addr];
    }

    function isSubnameAvailable(string calldata name) external view returns (bool) {
        return !subnames[name].exists;
    }

    function getProfile(address user)
        external
        view
        returns (string memory subname, string memory fullName, string memory mainnetENS, bool hasSubname)
    {
        UserProfile storage p = _profiles[user];
        string memory full = p.hasSubname ? string(abi.encodePacked(p.subname, ".", PARENT_NAME)) : "";
        return (p.subname, full, p.mainnetENS, p.hasSubname);
    }

    function getTextRecord(address user, string calldata key) external view returns (string memory) {
        return _profiles[user].textRecords[key];
    }

    // === Internal ===

    function _validateSubname(string calldata name) internal pure {
        bytes memory b = bytes(name);
        require(b.length >= 3 && b.length <= 32, "ENS: length 3-32");
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            bool valid = (c >= 0x61 && c <= 0x7A) // a-z
                || (c >= 0x30 && c <= 0x39) // 0-9
                || c == 0x2D; // dash
            require(valid, "ENS: invalid char");
        }
        require(b[0] != 0x2D && b[b.length - 1] != 0x2D, "ENS: no leading/trailing dash");
    }
}
