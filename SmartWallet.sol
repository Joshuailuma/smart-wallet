// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SmartWallet {
    // Wallet operations.
    struct Wallet {
        address walletAddress;
        uint256 balance;
        address owner;
    }
    // Mapping from user addresses to their wallet balances.
    mapping(address => Wallet) wallets;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 indexed amount
    );
    event WalletCreated(address indexed walletAddress);

    // This function allows user to create a new wallet.
    function createWallet() public {
        // Get the Wallet data from the storage
        Wallet storage gottenWallet = wallets[msg.sender];
        require(gottenWallet.balance == 0, "You already have a Wallet");
        // Create a new wallet
        Wallet memory wallet;
        wallet.walletAddress = msg.sender;
        wallet.balance = 0;
        wallet.owner = msg.sender;
        // Add the wallet to the mapping
        wallets[msg.sender] = wallet;
        // emit walletCreated event
        emit WalletCreated(wallet.walletAddress);
    }

    // Function to send funds from one wallet to another.
    function transfer(address to, uint256 amount) public {
        // Check if the sender has enough funds to make the transfer.
        require(wallets[msg.sender].balance >= amount);
        require(to != address(0));

        // Update the balances of the sender and recipient.
        wallets[msg.sender].balance -= amount;
        wallets[to].balance += amount;

        // Emit a Transfer event
        emit Transfer(msg.sender, to, amount);
    }

    function fundWallet() public payable {
        wallets[msg.sender].balance += msg.value;
    }

    // Function to view the balance of a wallet.
    function balanceOf() public view returns (uint256) {
        // Return the balance of the specified wallet.
        return wallets[msg.sender].balance;
    }
}
