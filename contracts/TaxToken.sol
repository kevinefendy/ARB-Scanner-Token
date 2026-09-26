// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TaxToken
 * @dev ERC20 token with buy and sell fee deductions.
 * Characteristics: 5% buy tax, 20% sell tax, fee receiver address.
 * Expected Risk Level: HIGH RISK (+20 High Sell Tax, +15 Active Owner = 35-50+ / 100).
 */
contract TaxToken {
    string public name = "Arbitrum Tax Token";
    string public symbol = "TAX";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    address public feeReceiver;

    // Fees in basis points (100 = 1%)
    uint256 public buyTax = 500;   // 5%
    uint256 public sellTax = 2000; // 20% (High tax threshold)

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isAutomatedMarketMakerPair;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FeesUpdated(uint256 buyTax, uint256 sellTax);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor(uint256 initialSupply) {
        owner = msg.sender;
        feeReceiver = msg.sender;
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function setAutomatedMarketMakerPair(address pair, bool value) external onlyOwner {
        isAutomatedMarketMakerPair[pair] = value;
    }

    function setTaxes(uint256 newBuyTax, uint256 newSellTax) external onlyOwner {
        require(newBuyTax <= 2500 && newSellTax <= 3000, "Tax exceeds maximum bounds");
        buyTax = newBuyTax;
        sellTax = newSellTax;
        emit FeesUpdated(newBuyTax, newSellTax);
    }

    function setFeeReceiver(address newReceiver) external onlyOwner {
        require(newReceiver != address(0), "Invalid fee receiver");
        feeReceiver = newReceiver;
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "ERC20: approve to the zero address");
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(allowance[from][msg.sender] >= amount, "ERC20: insufficient allowance");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        require(balanceOf[from] >= amount, "ERC20: transfer exceeds balance");

        uint256 feeAmount = 0;
        if (from != owner && to != owner) {
            if (isAutomatedMarketMakerPair[from]) {
                // Buy transaction
                feeAmount = (amount * buyTax) / 10000;
            } else if (isAutomatedMarketMakerPair[to]) {
                // Sell transaction
                feeAmount = (amount * sellTax) / 10000;
            } else {
                // Standard transfer nominal tax simulation
                feeAmount = (amount * buyTax) / 10000;
            }
        }

        uint256 transferAmount = amount - feeAmount;

        balanceOf[from] -= amount;
        balanceOf[to] += transferAmount;
        emit Transfer(from, to, transferAmount);

        if (feeAmount > 0) {
            balanceOf[feeReceiver] += feeAmount;
            emit Transfer(from, feeReceiver, feeAmount);
        }
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
