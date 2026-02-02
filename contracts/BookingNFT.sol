// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BookingNFT is ERC721 {
    uint public tokenId;

    constructor() ERC721("Slotify Booking", "SLOT") {}

    function mint(address to) external returns (uint) {
        tokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}