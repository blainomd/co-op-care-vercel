// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CoopGovernance
 * @notice Lightweight DAO for cooperative governance (Colorado ULCAA).
 *         One member = one vote (not token-weighted).
 *         Proposals expire after 7 days. Quorum is 25% of members.
 *         Bylaw changes require 67% supermajority.
 */
contract CoopGovernance is Ownable {
    // ─── State ────────────────────────────────────────────────

    mapping(address => bool) public isMember;
    uint256 public memberCount;

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        bytes callData;
        bool isBylawChange;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 createdAt;
        bool executed;
        bool canceled;
    }

    Proposal[] public proposals;

    /// @notice Tracks whether a member has voted on a given proposal
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_BPS = 2500; // 25% in basis points
    uint256 public constant SUPERMAJORITY_BPS = 6700; // 67%

    // ─── Events ───────────────────────────────────────────────

    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        bool isBylawChange
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support
    );
    event ProposalExecuted(uint256 indexed proposalId);

    // ─── Modifiers ────────────────────────────────────────────

    modifier onlyMember() {
        require(isMember[msg.sender], "CoopGovernance: caller is not a member");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────

    constructor() Ownable(msg.sender) {}

    // ─── Membership (owner only) ──────────────────────────────

    /**
     * @notice Add a cooperative member
     */
    function addMember(address member) external onlyOwner {
        require(!isMember[member], "CoopGovernance: already a member");
        isMember[member] = true;
        memberCount++;
        emit MemberAdded(member);
    }

    /**
     * @notice Remove a cooperative member
     */
    function removeMember(address member) external onlyOwner {
        require(isMember[member], "CoopGovernance: not a member");
        isMember[member] = false;
        memberCount--;
        emit MemberRemoved(member);
    }

    // ─── Proposals ────────────────────────────────────────────

    /**
     * @notice Create a new proposal. Any member can propose.
     * @param description  Human-readable proposal description
     * @param _callData    Encoded function call to execute if passed
     * @param isBylawChange Whether this requires supermajority (67%)
     * @return proposalId  The ID of the created proposal
     */
    function propose(
        string calldata description,
        bytes calldata _callData,
        bool isBylawChange
    ) external onlyMember returns (uint256 proposalId) {
        proposalId = proposals.length;

        proposals.push(Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: description,
            callData: _callData,
            isBylawChange: isBylawChange,
            forVotes: 0,
            againstVotes: 0,
            createdAt: block.timestamp,
            executed: false,
            canceled: false
        }));

        emit ProposalCreated(proposalId, msg.sender, description, isBylawChange);
    }

    /**
     * @notice Cast a vote on a proposal. One vote per member per proposal.
     * @param proposalId The proposal to vote on
     * @param support    true = for, false = against
     */
    function vote(uint256 proposalId, bool support) external onlyMember {
        require(proposalId < proposals.length, "CoopGovernance: invalid proposal");
        Proposal storage p = proposals[proposalId];

        require(!p.executed, "CoopGovernance: already executed");
        require(!p.canceled, "CoopGovernance: proposal canceled");
        require(
            block.timestamp <= p.createdAt + VOTING_PERIOD,
            "CoopGovernance: voting period ended"
        );
        require(!hasVoted[proposalId][msg.sender], "CoopGovernance: already voted");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            p.forVotes++;
        } else {
            p.againstVotes++;
        }

        emit VoteCast(proposalId, msg.sender, support);
    }

    /**
     * @notice Execute a proposal if quorum is met and it has majority/supermajority support.
     * @param proposalId The proposal to execute
     */
    function execute(uint256 proposalId) external onlyMember {
        require(proposalId < proposals.length, "CoopGovernance: invalid proposal");
        Proposal storage p = proposals[proposalId];

        require(!p.executed, "CoopGovernance: already executed");
        require(!p.canceled, "CoopGovernance: proposal canceled");
        require(
            block.timestamp <= p.createdAt + VOTING_PERIOD,
            "CoopGovernance: voting period ended"
        );

        uint256 totalVotes = p.forVotes + p.againstVotes;

        // Quorum: at least 25% of members must have voted
        uint256 quorumRequired = (memberCount * QUORUM_BPS) / 10000;
        if (quorumRequired == 0 && memberCount > 0) quorumRequired = 1;
        require(totalVotes >= quorumRequired, "CoopGovernance: quorum not reached");

        // Majority check
        if (p.isBylawChange) {
            // Supermajority: 67% of votes cast must be in favor
            require(
                p.forVotes * 10000 >= totalVotes * SUPERMAJORITY_BPS,
                "CoopGovernance: supermajority not reached"
            );
        } else {
            // Simple majority
            require(p.forVotes > p.againstVotes, "CoopGovernance: majority not reached");
        }

        p.executed = true;

        // Execute the calldata if any
        if (p.callData.length > 0) {
            (bool success, ) = address(this).call(p.callData);
            require(success, "CoopGovernance: execution failed");
        }

        emit ProposalExecuted(proposalId);
    }

    // ─── Views ────────────────────────────────────────────────

    /**
     * @notice Get the total number of proposals
     */
    function proposalCount() external view returns (uint256) {
        return proposals.length;
    }

    /**
     * @notice Check if a proposal is still within its voting period
     */
    function isActive(uint256 proposalId) external view returns (bool) {
        if (proposalId >= proposals.length) return false;
        Proposal storage p = proposals[proposalId];
        return !p.executed &&
               !p.canceled &&
               block.timestamp <= p.createdAt + VOTING_PERIOD;
    }
}
