// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract CrossWay {
    address public constant USDC = 0x3600000000000000000000000000000000000000;
    address public constant EURC = 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a;
    bytes32 public constant USERNAME = keccak256("username");
    bytes32 public constant EMAIL = keccak256("email");
    bytes32 public constant USER_ID = keccak256("userid");
    uint256 public constant MAX_EXPIRY = 90 days;

    address public owner;
    uint256 public nextPendingId;
    uint256 public nextInvoiceId;
    uint256 private locked = 1;

    mapping(address => bool) public tokenAllowed;
    mapping(bytes32 => address) public walletOf;
    mapping(address => mapping(bytes32 => bytes32)) public identityOf;
    mapping(uint256 => Pending) public pendings;
    mapping(bytes32 => uint256[]) public pendingIds;
    mapping(uint256 => Invoice) public invoices;

    struct Pending {
        address from;
        address token;
        uint256 amount;
        bytes32 key;
        uint64 expiresAt;
        uint32 index;
        bool closed;
    }

    struct Invoice {
        address payee;
        address payer;
        bytes32 payerKey;
        address token;
        uint256 amount;
        uint64 expiresAt;
        uint8 kind;
        bool closed;
    }

    event TokenAllowed(address indexed token, bool allowed);
    event IdentitySet(address indexed wallet, bytes32 indexed kind, bytes32 key);
    event IdentityCleared(address indexed wallet, bytes32 indexed kind, bytes32 key);
    event Paid(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        bytes32 key,
        uint8 method,
        uint256 refId,
        bytes memo
    );
    event PendingCreated(
        uint256 indexed id,
        address indexed from,
        bytes32 indexed key,
        address token,
        uint256 amount,
        uint64 expiresAt,
        bytes memo
    );
    event PendingRefunded(uint256 indexed id);
    event InvoiceCreated(
        uint256 indexed id,
        address indexed payee,
        address indexed payer,
        bytes32 payerKey,
        address token,
        uint256 amount,
        uint64 expiresAt,
        uint8 kind,
        bytes memo
    );
    event InvoiceCancelled(uint256 indexed id);

    error NotOwner();
    error Reentrant();
    error ZeroAmount();
    error ZeroAddress();
    error TokenNotAllowed();
    error Taken();
    error NotBound();
    error BadExpiry();
    error Closed();
    error NotSender();
    error NotDue();
    error NotPayer();
    error TransferFailed();
    error EmptyValue();
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
        tokenAllowed[USDC] = true;
        tokenAllowed[EURC] = true;
    }

    receive() external payable {
        revert NativeDisabled();
    }

    function setOwner(address next) external onlyOwner {
        if (next == address(0)) revert ZeroAddress();
        owner = next;
    }

    function setToken(address token, bool allowed) external onlyOwner {
        if (token == address(0)) revert ZeroAddress();
        tokenAllowed[token] = allowed;
        emit TokenAllowed(token, allowed);
    }

    function keyOf(bytes32 kind, string calldata value) public pure returns (bytes32) {
        if (bytes(value).length == 0) revert EmptyValue();
        return keccak256(abi.encodePacked(kind, keccak256(bytes(value))));
    }

    function resolve(bytes32 kind, string calldata value) external view returns (address) {
        return walletOf[keyOf(kind, value)];
    }

    function register(bytes32 kind, string calldata value) external nonReentrant {
        bytes32 key = keyOf(kind, value);
        if (walletOf[key] != address(0)) revert Taken();
        bytes32 oldKey = identityOf[msg.sender][kind];
        if (oldKey != bytes32(0)) {
            delete walletOf[oldKey];
            emit IdentityCleared(msg.sender, kind, oldKey);
        }
        walletOf[key] = msg.sender;
        identityOf[msg.sender][kind] = key;
        emit IdentitySet(msg.sender, kind, key);
        uint256 n = pendingIds[key].length;
        if (n > 20) n = 20;
        while (n > 0) {
            _release(pendingIds[key][pendingIds[key].length - 1], msg.sender);
            unchecked {
                --n;
            }
        }
    }

    function unregister(bytes32 kind) external {
        bytes32 key = identityOf[msg.sender][kind];
        if (key == bytes32(0)) revert NotBound();
        delete walletOf[key];
        delete identityOf[msg.sender][kind];
        emit IdentityCleared(msg.sender, kind, key);
    }

    function sendToAddress(address to, address token, uint256 amount, bytes calldata memo) external nonReentrant {
        if (to == address(0)) revert ZeroAddress();
        _pay(msg.sender, to, token, amount, bytes32(0), 0, 0, memo);
    }

    function sendTo(
        bytes32 kind,
        string calldata value,
        address token,
        uint256 amount,
        uint64 expiresAt,
        bytes calldata memo
    ) external nonReentrant {
        bytes32 key = keyOf(kind, value);
        address to = walletOf[key];
        if (to != address(0)) {
            _pay(msg.sender, to, token, amount, key, 0, 0, memo);
            return;
        }
        _check(token, amount, expiresAt);
        _move(token, msg.sender, address(this), amount);
        uint256 id = ++nextPendingId;
        uint256[] storage list = pendingIds[key];
        pendings[id] = Pending(msg.sender, token, amount, key, expiresAt, uint32(list.length), false);
        list.push(id);
        emit PendingCreated(id, msg.sender, key, token, amount, expiresAt, memo);
    }

    function createRequest(
        address payer,
        address token,
        uint256 amount,
        uint64 expiresAt,
        bytes calldata memo
    ) external returns (uint256) {
        if (payer == address(0)) revert ZeroAddress();
        return _invoice(payer, bytes32(0), token, amount, expiresAt, 0, memo);
    }

    function createRequestTo(
        bytes32 kind,
        string calldata value,
        address token,
        uint256 amount,
        uint64 expiresAt,
        bytes calldata memo
    ) external returns (uint256) {
        return _invoice(address(0), keyOf(kind, value), token, amount, expiresAt, 0, memo);
    }

    function createLink(address token, uint256 amount, uint64 expiresAt, bytes calldata memo) external returns (uint256) {
        return _invoice(address(0), bytes32(0), token, amount, expiresAt, 1, memo);
    }

    function pay(uint256 id, bytes calldata memo) external nonReentrant {
        Invoice storage inv = invoices[id];
        if (inv.closed) revert Closed();
        if (block.timestamp > inv.expiresAt) revert NotDue();
        if (inv.payer != address(0) && inv.payer != msg.sender) revert NotPayer();
        if (inv.payerKey != bytes32(0) && walletOf[inv.payerKey] != msg.sender) revert NotPayer();
        inv.closed = true;
        _pay(msg.sender, inv.payee, inv.token, inv.amount, inv.payerKey, inv.kind == 1 ? 2 : 1, id, memo);
    }

    function cancel(uint256 id) external {
        Invoice storage inv = invoices[id];
        if (inv.closed) revert Closed();
        if (inv.payee != msg.sender) revert NotSender();
        inv.closed = true;
        emit InvoiceCancelled(id);
    }

    function claim(uint256 id) external nonReentrant {
        Pending storage p = pendings[id];
        if (p.closed) revert Closed();
        if (walletOf[p.key] != msg.sender) revert NotBound();
        _release(id, msg.sender);
    }

    function refund(uint256 id) external nonReentrant {
        Pending storage p = pendings[id];
        if (p.closed) revert Closed();
        if (p.from != msg.sender) revert NotSender();
        if (block.timestamp < p.expiresAt) revert NotDue();
        p.closed = true;
        _detach(p);
        _move(p.token, address(this), p.from, p.amount);
        emit PendingRefunded(id);
    }

    function _invoice(
        address payer,
        bytes32 payerKey,
        address token,
        uint256 amount,
        uint64 expiresAt,
        uint8 kind,
        bytes calldata memo
    ) internal returns (uint256 id) {
        _check(token, amount, expiresAt);
        id = ++nextInvoiceId;
        invoices[id] = Invoice(msg.sender, payer, payerKey, token, amount, expiresAt, kind, false);
        emit InvoiceCreated(id, msg.sender, payer, payerKey, token, amount, expiresAt, kind, memo);
    }

    function _release(uint256 id, address to) internal {
        Pending storage p = pendings[id];
        p.closed = true;
        _detach(p);
        _move(p.token, address(this), to, p.amount);
        emit Paid(p.from, to, p.token, p.amount, p.key, 3, id, "");
    }

    function _detach(Pending storage p) internal {
        uint256[] storage list = pendingIds[p.key];
        uint256 lastIdx = list.length - 1;
        uint256 lastId = list[lastIdx];
        if (p.index != lastIdx) {
            list[p.index] = lastId;
            pendings[lastId].index = p.index;
        }
        list.pop();
    }

    function _pay(
        address from,
        address to,
        address token,
        uint256 amount,
        bytes32 key,
        uint8 method,
        uint256 refId,
        bytes memory memo
    ) internal {
        if (amount == 0) revert ZeroAmount();
        if (!tokenAllowed[token]) revert TokenNotAllowed();
        _move(token, from, to, amount);
        emit Paid(from, to, token, amount, key, method, refId, memo);
    }

    function _move(address token, address from, address to, uint256 amount) internal {
        bool ok = from == address(this)
            ? IERC20(token).transfer(to, amount)
            : IERC20(token).transferFrom(from, to, amount);
        if (!ok) revert TransferFailed();
    }

    function _check(address token, uint256 amount, uint64 expiresAt) internal view {
        if (amount == 0) revert ZeroAmount();
        if (!tokenAllowed[token]) revert TokenNotAllowed();
        if (expiresAt <= block.timestamp || expiresAt > block.timestamp + MAX_EXPIRY) revert BadExpiry();
    }
}
