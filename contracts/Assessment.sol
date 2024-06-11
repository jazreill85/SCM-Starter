// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    // Item prices
    uint256 constant SOLDERING_WICK_COST = 20;
    uint256 constant ROSIN_COST = 50;
    uint256 constant SOLDER_SUCTION_COST = 10;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Transfer(address indexed recipient, uint256 amount);
    event Redeem(string item, uint256 cost);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // Ensure the amount is greater than 0
        require(_amount > 0, "Deposit amount must be greater than zero");
        // Ensure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Perform transaction
        balance += _amount;

        // Assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // Emit the event
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // Withdraw the given amount
        balance -= _withdrawAmount;

        // Assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // Emit the event
        emit Withdraw(_withdrawAmount);
    }

    function transfer(address recipient, uint256 amount) public {
        // Ensure the recipient address is not the zero address
        require(recipient != address(0), "Invalid recipient address");
        // Ensure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");
        // Ensure there are sufficient funds to transfer
        require(amount <= balance, "Insufficient balance");
        // Ensure the amount is greater than 10
        assert(amount > 10);

        uint _previousBalance = balance;

        // Perform transaction
        balance -= amount;

        // Assert the balance is correct
        assert(balance == (_previousBalance - amount));
        // Emit the event
        emit Transfer(recipient, amount);
    }

    function redeem(string memory item) public {
        uint256 cost;

        // Determine the cost of the item
        if (keccak256(abi.encodePacked(item)) == keccak256(abi.encodePacked("soldering wick"))) {
            cost = SOLDERING_WICK_COST;
        } else if (keccak256(abi.encodePacked(item)) == keccak256(abi.encodePacked("rosin"))) {
            cost = ROSIN_COST;
        } else if (keccak256(abi.encodePacked(item)) == keccak256(abi.encodePacked("solder suction"))) {
            cost = SOLDER_SUCTION_COST;
        } else {
            // If the item is not recognized, revert the transaction
            revert("Item not recognized");
        }

        // Ensure there are sufficient funds to redeem the item
        require(cost <= balance, "Insufficient balance to redeem this item");

        uint _previousBalance = balance;

        // Perform transaction
        balance -= cost;

        // Assert the balance is correct
        assert(balance == (_previousBalance - cost));

        // Emit the event
        emit Redeem(item, cost);
    }
}
