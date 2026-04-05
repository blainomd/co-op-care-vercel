// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CareHourToken
 * @notice ERC-20 token for spendable Time Bank hours, plus soulbound prestige hours.
 *         Only the cooperative contract (owner) can mint. Prestige hours are
 *         non-transferable — they represent reputation, not currency.
 *
 *         NO PHI is stored on-chain. Only addresses, amounts, and visit IDs.
 */
contract CareHourToken is ERC20, Ownable {
    /// @notice Soulbound prestige balance per account (non-transferable)
    mapping(address => uint256) private _prestige;

    /// @notice Total prestige minted across all accounts
    uint256 public totalPrestige;

    /// @notice Emitted when a care visit is verified and hours are minted
    event CareVerified(
        address indexed provider,
        address indexed recipient,
        uint256 hours,
        string visitId
    );

    /// @notice Emitted when prestige hours are minted
    event PrestigeMinted(address indexed account, uint256 amount);

    constructor() ERC20("CareHour", "CARE") Ownable(msg.sender) {}

    // ─── Mint / Burn (owner only) ─────────────────────────────

    /**
     * @notice Mint spendable hours when a care visit is verified
     * @param to       Provider wallet receiving hours
     * @param amount   Number of hours (in token decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Mint soulbound prestige hours (cannot be transferred)
     * @param to       Account receiving prestige
     * @param amount   Prestige hours to mint
     */
    function mintPrestige(address to, uint256 amount) external onlyOwner {
        _prestige[to] += amount;
        totalPrestige += amount;
        emit PrestigeMinted(to, amount);
    }

    /**
     * @notice Burn spendable hours when redeemed
     * @param from     Account whose hours are burned
     * @param amount   Hours to burn
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @notice Emit a CareVerified event (for indexing / audit trail)
     * @param provider   Caregiver address
     * @param recipient  Care-recipient address
     * @param hours      Hours of care delivered
     * @param visitId    Off-chain visit identifier
     */
    function recordCareVisit(
        address provider,
        address recipient,
        uint256 hours,
        string calldata visitId
    ) external onlyOwner {
        emit CareVerified(provider, recipient, hours, visitId);
    }

    // ─── Prestige Queries ─────────────────────────────────────

    /**
     * @notice View prestige (soulbound) balance
     */
    function prestigeOf(address account) external view returns (uint256) {
        return _prestige[account];
    }

    // ─── Transfer Restrictions ────────────────────────────────

    /**
     * @dev Override transfer to ensure only spendable tokens move.
     *      Prestige is tracked in a separate mapping and never enters
     *      the ERC-20 balance, so standard transfer already excludes it.
     *      This override is kept explicit for clarity.
     */
    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        return super.transfer(to, amount);
    }

    /**
     * @dev Override transferFrom — same reasoning as transfer().
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        return super.transferFrom(from, to, amount);
    }
}
