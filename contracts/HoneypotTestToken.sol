// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneypotTestToken
 * @dev Reference token simulating transfer restrictions (for scanner testing only).
 * Characteristics: Blacklist mechanism, transfer lock simulator, unrenounced owner.
 * Expected Risk Level: HIGH RISK (+20 Blacklist, +10 Pause, +15 Active Owner = 45+ / 100).
 * NOTE: For testing purposes on Arbitrum Sepolia only.
 */
contract HoneypotTestToken {
    string public name = "Arbitrum Honeypot Test Token";
    string public symbol = "HONEY";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    address public owner;
    bool public paused = false;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public isBlacklisted;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BlacklistUpdated(address indexed target, bool status);
    event PauseUpdated(bool isPaused);

    modifier onlyOwner() {
        require(msg.sender == owner, "Ownable: caller is not the owner");
        _;
    }

    constructor(uint256 initialSupply) {
        owner = msg.sender;
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function setBlacklist(address account, bool status) external onlyOwner {
        isBlacklisted[account] = status;
        emit BlacklistUpdated(account, status);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PauseUpdated(_paused);
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _validateAndTransfer(msg.sender, to, amount);
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
        _validateAndTransfer(from, to, amount);
        return true;
    }

    function _validateAndTransfer(address from, address to, uint256 amount) internal {
        require(!paused, "TOKEN_PAUSED_BY_ADMIN");
        require(!isBlacklisted[from], "TRANSFER_RESTRICTED_HONEYPOT: sender is blacklisted");
        require(!isBlacklisted[to], "TRANSFER_RESTRICTED_HONEYPOT: recipient is blacklisted");
        require(to != address(0), "ERC20: transfer to the zero address");
        require(balanceOf[from] >= amount, "ERC20: transfer amount exceeds balance");

        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
