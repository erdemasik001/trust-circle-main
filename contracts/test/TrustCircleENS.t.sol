// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {TrustCircleENS} from "../src/identity/TrustCircleENS.sol";

contract TrustCircleENSTest is Test {
    TrustCircleENS ens;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        ens = new TrustCircleENS();
    }

    // ═══════════════════════════════════════════
    //           SUBNAME CLAIM
    // ═══════════════════════════════════════════

    function test_claimSubname() public {
        vm.prank(alice);
        ens.claimSubname("alice");

        (string memory subname, string memory fullName,, bool has) = ens.getProfile(alice);
        assertEq(subname, "alice");
        assertEq(fullName, "alice.trustcircle.eth");
        assertTrue(has);
    }

    function test_claimSubname_resolve() public {
        vm.prank(alice);
        ens.claimSubname("alice");

        address resolved = ens.resolve("alice");
        assertEq(resolved, alice);
    }

    function test_claimSubname_reverseResolve() public {
        vm.prank(alice);
        ens.claimSubname("alice");

        string memory name = ens.reverseResolve(alice);
        assertEq(name, "alice.trustcircle.eth");
    }

    function test_claimSubname_duplicate() public {
        vm.prank(alice);
        ens.claimSubname("alice");

        vm.prank(bob);
        vm.expectRevert("ENS: name taken");
        ens.claimSubname("alice");
    }

    function test_claimSubname_cannotClaimTwice() public {
        vm.startPrank(alice);
        ens.claimSubname("alice");
        vm.expectRevert("ENS: already claimed");
        ens.claimSubname("alice2");
        vm.stopPrank();
    }

    // ═══════════════════════════════════════════
    //           VALIDATION
    // ═══════════════════════════════════════════

    function test_validation_tooShort() public {
        vm.prank(alice);
        vm.expectRevert("ENS: length 3-32");
        ens.claimSubname("ab");
    }

    function test_validation_tooLong() public {
        vm.prank(alice);
        vm.expectRevert("ENS: length 3-32");
        ens.claimSubname("abcdefghijklmnopqrstuvwxyz1234567"); // 33 chars
    }

    function test_validation_uppercase() public {
        vm.prank(alice);
        vm.expectRevert("ENS: invalid char");
        ens.claimSubname("Alice");
    }

    function test_validation_specialChars() public {
        vm.prank(alice);
        vm.expectRevert("ENS: invalid char");
        ens.claimSubname("al!ce");
    }

    function test_validation_leadingDash() public {
        vm.prank(alice);
        vm.expectRevert("ENS: no leading/trailing dash");
        ens.claimSubname("-alice");
    }

    function test_validation_trailingDash() public {
        vm.prank(alice);
        vm.expectRevert("ENS: no leading/trailing dash");
        ens.claimSubname("alice-");
    }

    function test_validation_dashInMiddle() public {
        vm.prank(alice);
        ens.claimSubname("al-ice"); // should work
        address resolved = ens.resolve("al-ice");
        assertEq(resolved, alice);
    }

    function test_validation_numbersOk() public {
        vm.prank(alice);
        ens.claimSubname("alice123");
        address resolved = ens.resolve("alice123");
        assertEq(resolved, alice);
    }

    function test_validation_minLength() public {
        vm.prank(alice);
        ens.claimSubname("abc"); // exactly 3
        assertTrue(ens.isSubnameAvailable("abc") == false);
    }

    // ═══════════════════════════════════════════
    //           TRANSFER
    // ═══════════════════════════════════════════

    function test_transfer() public {
        vm.prank(alice);
        ens.claimSubname("alice");

        vm.prank(alice);
        ens.transferSubname(bob);

        // Alice should have nothing
        (,, , bool aliceHas) = ens.getProfile(alice);
        assertFalse(aliceHas);

        // Bob should own it
        (string memory subname,,, bool bobHas) = ens.getProfile(bob);
        assertTrue(bobHas);
        assertEq(subname, "alice"); // name stays the same

        // Resolution should point to bob
        assertEq(ens.resolve("alice"), bob);
    }

    function test_transfer_recipientAlreadyHasSubname() public {
        vm.prank(alice);
        ens.claimSubname("alice");
        vm.prank(bob);
        ens.claimSubname("bob");

        vm.prank(alice);
        vm.expectRevert("ENS: recipient has subname");
        ens.transferSubname(bob);
    }

    function test_transfer_noSubname() public {
        vm.prank(alice);
        vm.expectRevert("ENS: no subname");
        ens.transferSubname(bob);
    }

    // ═══════════════════════════════════════════
    //           TEXT RECORDS
    // ═══════════════════════════════════════════

    function test_textRecords_set() public {
        vm.startPrank(alice);
        ens.claimSubname("alice");
        ens.setTextRecord("trustcircle.reputation", "450");
        ens.setTextRecord("trustcircle.tier", "Building");
        ens.setTextRecord("description", "Freelance designer");
        vm.stopPrank();

        assertEq(ens.getTextRecord(alice, "trustcircle.reputation"), "450");
        assertEq(ens.getTextRecord(alice, "trustcircle.tier"), "Building");
        assertEq(ens.getTextRecord(alice, "description"), "Freelance designer");
    }

    function test_textRecords_requiresSubname() public {
        vm.prank(alice);
        vm.expectRevert("ENS: no subname");
        ens.setTextRecord("key", "value");
    }

    function test_textRecords_overwrite() public {
        vm.startPrank(alice);
        ens.claimSubname("alice");
        ens.setTextRecord("rep", "100");
        ens.setTextRecord("rep", "200");
        vm.stopPrank();

        assertEq(ens.getTextRecord(alice, "rep"), "200");
    }

    // ═══════════════════════════════════════════
    //           MAINNET ENS LINK
    // ═══════════════════════════════════════════

    function test_linkMainnetENS() public {
        vm.prank(alice);
        ens.linkMainnetENS("alice.eth");

        (,, string memory mainnet,) = ens.getProfile(alice);
        assertEq(mainnet, "alice.eth");
    }

    // ═══════════════════════════════════════════
    //           AVAILABILITY CHECK
    // ═══════════════════════════════════════════

    function test_isAvailable() public {
        assertTrue(ens.isSubnameAvailable("alice"));

        vm.prank(alice);
        ens.claimSubname("alice");

        assertFalse(ens.isSubnameAvailable("alice"));
        assertTrue(ens.isSubnameAvailable("bob"));
    }
}
