// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint amount) external returns (bool);
}

contract SlotifyRefunds {
    address public admin;

    struct Payment {
        address user;
        address token;
        uint amount;
        bool refunded;
    }

    mapping(bytes32 => Payment) public payments;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function recordPayment(
        bytes32 bookingId,
        address user,
        address token,
        uint amount
    ) external onlyAdmin {
        payments[bookingId] = Payment(user, token, amount, false);
    }

    function refund(bytes32 bookingId, uint refundAmount) external onlyAdmin {
        Payment storage p = payments[bookingId];
        require(!p.refunded, "Already refunded");
        require(refundAmount <= p.amount, "Invalid refund");

        IERC20(p.token).transfer(p.user, refundAmount);
        p.refunded = true;
    }
}