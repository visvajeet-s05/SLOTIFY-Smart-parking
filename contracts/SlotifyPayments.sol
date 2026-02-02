// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint amount) external returns (bool);
}

contract SlotifyPayments {
    address public platformWallet;
    address public taxWallet;

    uint public constant OWNER_SHARE = 70;
    uint public constant PLATFORM_SHARE = 25;
    uint public constant TAX_SHARE = 5;

    event PaymentProcessed(
        address indexed payer,
        address indexed owner,
        uint amount,
        address token
    );

    constructor(address _platformWallet, address _taxWallet) {
        platformWallet = _platformWallet;
        taxWallet = _taxWallet;
    }

    function pay(
        address token,
        address owner,
        uint amount
    ) external {
        require(amount > 0, "Invalid amount");

        uint ownerAmount = (amount * OWNER_SHARE) / 100;
        uint platformAmount = (amount * PLATFORM_SHARE) / 100;
        uint taxAmount = (amount * TAX_SHARE) / 100;

        IERC20(token).transferFrom(msg.sender, owner, ownerAmount);
        IERC20(token).transferFrom(msg.sender, platformWallet, platformAmount);
        IERC20(token).transferFrom(msg.sender, taxWallet, taxAmount);

        emit PaymentProcessed(msg.sender, owner, amount, token);
    }
}