// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CrossWay {
    address public constant USDC = 0x3600000000000000000000000000000000000000;
    address public constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
    uint256 public constant MAX_EXPIRY = 90 days;
    uint256 public constant FEE_BPS = 5;

    address public owner;
    uint256 public nextInvoiceId;
    uint256 private locked = 1;

    mapping(address => bool) public extraToken;
    mapping(uint256 => Invoice) public invoices;

    struct Invoice {
        address payee;
        address payer;
        address token;
        uint256 amount;
        uint64 expiresAt;
    }

    event Paid(address indexed from, address indexed to, address indexed token, uint256 amount, uint8 method, uint256 refId, bytes memo);
    event InvoiceCreated(uint256 indexed id, address indexed payee, address indexed payer, address token, uint256 amount, uint64 expiresAt, bytes memo);
    event InvoiceCancelled(uint256 indexed id);

    error NotOwner();
    error Reentrant();
    error ZeroAmount();
    error ZeroAddress();
    error TokenNotAllowed();
    error BadExpiry();
    error Closed();
    error NotSender();
    error NotDue();
    error NotPayer();
    error TransferFailed();
    error NativeDisabled();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier nonReentrant() {
        if (locked != 1) revert Reentrant();
        locked = 2;
        _;
        locked = 1;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {
        revert NativeDisabled();
    }

    function setOwner(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        owner = next;
    }

    function setToken(address token, bool allowed) external onlyOwner {
        if (token == address(0) || token == USDC || token == EURC) revert ZeroAddress();
        extraToken[token] = allowed;
    }

    function sendToAddress(address to, address token, uint256 amount, bytes calldata memo) external nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        _pay(msg.sender, to, token, amount, 0, 0, memo);
    }

    function createRequest(address payer, address token, uint256 amount, uint64 expiresAt, bytes calldata memo) external returns (uint256) {
        if (payer == address(0)) revert ZeroAddress();
        return _invoice(payer, token, amount, expiresAt, memo);
    }

    function createLink(address token, uint256 amount, uint64 expiresAt, bytes calldata memo) external returns (uint256) {
        return _invoice(address(0), token, amount, expiresAt, memo);
    }

    function pay(uint256 id, bytes calldata memo) external nonReentrant {
        Invoice memory inv = invoices[id];
        if (inv.payee == address(0)) revert Closed();
        if (block.timestamp > inv.expiresAt) revert NotDue();
        if (inv.payer != address(0) && inv.payer != msg.sender) revert NotPayer();
        uint8 method = inv.payer == address(0) ? 2 : 1;
        delete invoices[id];
        _pay(msg.sender, inv.payee, inv.token, inv.amount, method, id, memo);
    }

    function cancel(uint256 id) external {
        Invoice storage inv = invoices[id];
        if (inv.payee == address(0)) revert Closed();
        if (inv.payee != msg.sender) revert NotSender();
        delete invoices[id];
        emit InvoiceCancelled(id);
    }

    function _ok(address token) internal view returns (bool) {
        return token == USDC || token == EURC || extraToken[token];
    }

    function _invoice(address payer, address token, uint256 amount, uint64 expiresAt, bytes calldata memo) internal returns (uint256 id) {
        _check(token, amount, expiresAt);
        id = ++nextInvoiceId;
        invoices[id] = Invoice(msg.sender, payer, token, amount, expiresAt);
        emit InvoiceCreated(id, msg.sender, payer, token, amount, expiresAt, memo);
    }

    function _pay(address from, address to, address token, uint256 amount, uint8 method, uint256 refId, bytes memory memo) internal {
        if (amount == 0) revert ZeroAmount();
        if (!_ok(token)) revert TokenNotAllowed();
        uint256 fee = (amount * FEE_BPS) / 1000;
        uint256 sendAmt = amount - fee;
        if (fee != 0 && owner != to) {
            if (!IERC20(token).transferFrom(from, owner, fee)) revert TransferFailed();
        } else {
            sendAmt = amount;
        }
        if (!IERC20(token).transferFrom(from, to, sendAmt)) revert TransferFailed();
        emit Paid(from, to, token, amount, method, refId, memo);
    }

    function _check(address token, uint256 amount, uint64 expiresAt) internal view {
        if (amount == 0) revert ZeroAmount();
        if (!_ok(token)) revert TokenNotAllowed();
        if (expiresAt <= block.timestamp || expiresAt > block.timestamp + MAX_EXPIRY) revert BadExpiry();
    }
}
