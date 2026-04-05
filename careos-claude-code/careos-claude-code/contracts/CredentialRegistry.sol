// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CredentialRegistry
 * @notice Stores hashes of signed LMNs and capability badges on-chain.
 *         NO PHI is stored — only document hashes, addresses, and timestamps.
 *         This provides an immutable audit trail for credential verification.
 */
contract CredentialRegistry is Ownable {
    // ─── LMN Registry ─────────────────────────────────────────

    struct LMNRecord {
        address physician;      // Signing physician's address
        uint256 registeredAt;   // Block timestamp when registered
        uint256 expiresAt;      // Expiration timestamp
        bool revoked;           // Whether the LMN has been revoked
    }

    /// @notice Document hash → LMN record
    mapping(bytes32 => LMNRecord) public lmnRecords;

    /// @notice Track all registered LMN hashes for enumeration
    bytes32[] public lmnHashes;

    // ─── Capability Badges ────────────────────────────────────

    struct Capability {
        bytes32 capabilityHash;
        string capabilityName;
        uint256 grantedAt;
        bool active;
    }

    /// @notice Caregiver address → list of capabilities
    mapping(address => Capability[]) private _capabilities;

    /// @notice Quick lookup: caregiver → capabilityHash → index in array (1-indexed, 0 = not found)
    mapping(address => mapping(bytes32 => uint256)) private _capabilityIndex;

    // ─── Events ───────────────────────────────────────────────

    event LMNRegistered(
        bytes32 indexed documentHash,
        address indexed physician,
        uint256 expiresAt
    );

    event LMNRevoked(bytes32 indexed documentHash);

    event CapabilityGranted(
        address indexed caregiver,
        bytes32 indexed capabilityHash,
        string capabilityName
    );

    event CapabilityRevoked(
        address indexed caregiver,
        bytes32 indexed capabilityHash
    );

    // ─── Constructor ──────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── LMN Functions ────────────────────────────────────────

    /**
     * @notice Register a signed LMN document hash on-chain
     * @param documentHash  SHA-256 hash of the signed LMN document
     * @param physician     Address of the signing physician
     * @param expiresAt     Unix timestamp when the LMN expires
     */
    function registerLMN(
        bytes32 documentHash,
        address physician,
        uint256 expiresAt
    ) external onlyOwner {
        require(
            lmnRecords[documentHash].registeredAt == 0,
            "CredentialRegistry: LMN already registered"
        );
        require(physician != address(0), "CredentialRegistry: invalid physician address");
        require(expiresAt > block.timestamp, "CredentialRegistry: expiry must be in the future");

        lmnRecords[documentHash] = LMNRecord({
            physician: physician,
            registeredAt: block.timestamp,
            expiresAt: expiresAt,
            revoked: false
        });

        lmnHashes.push(documentHash);

        emit LMNRegistered(documentHash, physician, expiresAt);
    }

    /**
     * @notice Verify an LMN by its document hash
     * @param documentHash  Hash to verify
     * @return physician    The signing physician's address
     * @return timestamp    When the LMN was registered
     * @return expiresAt    When the LMN expires
     * @return valid        Whether the LMN is currently valid (registered, not revoked, not expired)
     */
    function verifyLMN(
        bytes32 documentHash
    )
        external
        view
        returns (
            address physician,
            uint256 timestamp,
            uint256 expiresAt,
            bool valid
        )
    {
        LMNRecord storage record = lmnRecords[documentHash];
        physician = record.physician;
        timestamp = record.registeredAt;
        expiresAt = record.expiresAt;
        valid = record.registeredAt > 0 &&
                !record.revoked &&
                block.timestamp <= record.expiresAt;
    }

    /**
     * @notice Revoke a registered LMN
     * @param documentHash  Hash of the LMN to revoke
     */
    function revokeLMN(bytes32 documentHash) external onlyOwner {
        require(
            lmnRecords[documentHash].registeredAt > 0,
            "CredentialRegistry: LMN not registered"
        );
        lmnRecords[documentHash].revoked = true;
        emit LMNRevoked(documentHash);
    }

    // ─── Capability Functions ─────────────────────────────────

    /**
     * @notice Grant a capability badge to a caregiver
     * @param caregiver       Address of the caregiver
     * @param capabilityHash  Hash identifying the capability type
     * @param capabilityName  Human-readable capability name (e.g., "CPR Certified")
     */
    function grantCapability(
        address caregiver,
        bytes32 capabilityHash,
        string calldata capabilityName
    ) external onlyOwner {
        require(caregiver != address(0), "CredentialRegistry: invalid caregiver");
        require(
            _capabilityIndex[caregiver][capabilityHash] == 0,
            "CredentialRegistry: capability already granted"
        );

        _capabilities[caregiver].push(Capability({
            capabilityHash: capabilityHash,
            capabilityName: capabilityName,
            grantedAt: block.timestamp,
            active: true
        }));

        // Store 1-indexed position
        _capabilityIndex[caregiver][capabilityHash] = _capabilities[caregiver].length;

        emit CapabilityGranted(caregiver, capabilityHash, capabilityName);
    }

    /**
     * @notice Revoke a capability badge from a caregiver
     * @param caregiver       Address of the caregiver
     * @param capabilityHash  Hash of the capability to revoke
     */
    function revokeCapability(
        address caregiver,
        bytes32 capabilityHash
    ) external onlyOwner {
        uint256 idx = _capabilityIndex[caregiver][capabilityHash];
        require(idx > 0, "CredentialRegistry: capability not found");

        _capabilities[caregiver][idx - 1].active = false;

        emit CapabilityRevoked(caregiver, capabilityHash);
    }

    /**
     * @notice Get all active capabilities for a caregiver
     * @param caregiver  Address to query
     * @return hashes    Array of active capability hashes
     * @return names     Array of active capability names
     * @return grantedAt Array of grant timestamps
     */
    function getCapabilities(
        address caregiver
    )
        external
        view
        returns (
            bytes32[] memory hashes,
            string[] memory names,
            uint256[] memory grantedAt
        )
    {
        Capability[] storage caps = _capabilities[caregiver];
        uint256 activeCount = 0;

        // Count active capabilities
        for (uint256 i = 0; i < caps.length; i++) {
            if (caps[i].active) activeCount++;
        }

        hashes = new bytes32[](activeCount);
        names = new string[](activeCount);
        grantedAt = new uint256[](activeCount);

        uint256 j = 0;
        for (uint256 i = 0; i < caps.length; i++) {
            if (caps[i].active) {
                hashes[j] = caps[i].capabilityHash;
                names[j] = caps[i].capabilityName;
                grantedAt[j] = caps[i].grantedAt;
                j++;
            }
        }
    }

    /**
     * @notice Get total number of registered LMNs
     */
    function lmnCount() external view returns (uint256) {
        return lmnHashes.length;
    }
}
