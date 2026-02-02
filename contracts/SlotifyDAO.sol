// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SlotifyDAO {
    address public admin;
    uint public platformFee;

    constructor() {
        admin = msg.sender;
        platformFee = 25;
    }

    function updatePlatformFee(uint newFee) external {
        require(msg.sender == admin, "Only admin");
        require(newFee <= 30, "Fee too high");
        platformFee = newFee;
    }
}