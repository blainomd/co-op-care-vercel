/**
 * Web3 Service — Blockchain integration for CareOS
 *
 * Handles Time Bank hour minting, LMN credential registration,
 * capability badges, and cooperative governance on Base L2.
 *
 * HIPAA-safe: NO PHI is sent to the blockchain — only hashes,
 * addresses, amounts, and visit IDs.
 *
 * Feature-flagged: when WEB3_ENABLED !== 'true', all methods
 * return successfully with no txHash (graceful no-op).
 */
import { logger } from '../../common/logger.js';

// ─── ABI fragments (only the functions we call) ────────────
// These are minimal ABI fragments so we don't need to import full artifacts.

const CARE_HOUR_TOKEN_ABI = [
  'function mint(address to, uint256 amount) external',
  'function mintPrestige(address to, uint256 amount) external',
  'function burn(address from, uint256 amount) external',
  'function recordCareVisit(address provider, address recipient, uint256 hours, string visitId) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function prestigeOf(address account) external view returns (uint256)',
] as const;

const COOP_GOVERNANCE_ABI = [
  'function propose(string description, bytes callData, bool isBylawChange) external returns (uint256)',
  'function vote(uint256 proposalId, bool support) external',
  'function execute(uint256 proposalId) external',
  'function proposalCount() external view returns (uint256)',
  'function proposals(uint256) external view returns (uint256 id, address proposer, string description, bytes callData, bool isBylawChange, uint256 forVotes, uint256 againstVotes, uint256 createdAt, bool executed, bool canceled)',
  'function isActive(uint256 proposalId) external view returns (bool)',
  'function isMember(address) external view returns (bool)',
  'function memberCount() external view returns (uint256)',
] as const;

const CREDENTIAL_REGISTRY_ABI = [
  'function registerLMN(bytes32 documentHash, address physician, uint256 expiresAt) external',
  'function verifyLMN(bytes32 documentHash) external view returns (address physician, uint256 timestamp, uint256 expiresAt, bool valid)',
  'function revokeLMN(bytes32 documentHash) external',
  'function grantCapability(address caregiver, bytes32 capabilityHash, string capabilityName) external',
  'function revokeCapability(address caregiver, bytes32 capabilityHash) external',
  'function getCapabilities(address caregiver) external view returns (bytes32[] hashes, string[] names, uint256[] grantedAt)',
] as const;

// ─── Lazy-loaded ethers (not a hard dependency) ────────────
// ethers v6 is dynamically imported to avoid hard dependency.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _ethers: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getEthers(): Promise<any> {
  if (!_ethers) {
    // Use variable to bypass TypeScript's static module resolution
    const mod = 'ethers';
    _ethers = await import(/* webpackIgnore: true */ mod);
  }
  return _ethers;
}

// ─── Contract instances (cached) ───────────────────────────

interface ContractInstances {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  careHourToken: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coopGovernance: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  credentialRegistry: any;
}

let _contracts: ContractInstances | null = null;

async function getContracts(): Promise<ContractInstances> {
  if (_contracts) return _contracts;

  const ethers = await getEthers();

  const rpcUrl = process.env['WEB3_RPC_URL'];
  const privateKey = process.env['WEB3_PRIVATE_KEY'];

  if (!rpcUrl || !privateKey) {
    throw new Error('WEB3_RPC_URL and WEB3_PRIVATE_KEY must be set when WEB3_ENABLED=true');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privateKey, provider);

  const careHourTokenAddr = process.env['WEB3_CARE_HOUR_TOKEN_ADDRESS'] ?? '';
  const coopGovernanceAddr = process.env['WEB3_COOP_GOVERNANCE_ADDRESS'] ?? '';
  const credentialRegistryAddr = process.env['WEB3_CREDENTIAL_REGISTRY_ADDRESS'] ?? '';

  if (!careHourTokenAddr || !coopGovernanceAddr || !credentialRegistryAddr) {
    throw new Error(
      'WEB3_CARE_HOUR_TOKEN_ADDRESS, WEB3_COOP_GOVERNANCE_ADDRESS, and WEB3_CREDENTIAL_REGISTRY_ADDRESS must be set',
    );
  }

  _contracts = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    careHourToken: new ethers.Contract(careHourTokenAddr, CARE_HOUR_TOKEN_ABI, signer) as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    coopGovernance: new ethers.Contract(coopGovernanceAddr, COOP_GOVERNANCE_ABI, signer) as any,
    credentialRegistry: new ethers.Contract(
      credentialRegistryAddr,
      CREDENTIAL_REGISTRY_ABI,
      signer,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any,
  };

  logger.info(
    {
      careHourToken: careHourTokenAddr,
      coopGovernance: coopGovernanceAddr,
      credentialRegistry: credentialRegistryAddr,
    },
    'Web3 contracts initialized',
  );

  return _contracts;
}

// ─── Helpers ──────────────────────────────────────────────

function isEnabled(): boolean {
  return process.env['WEB3_ENABLED'] === 'true';
}

/**
 * Convert a hex string document hash to bytes32.
 * If the input is not already 0x-prefixed, adds the prefix.
 */
async function toBytes32(hash: string): Promise<string> {
  const ethers = await getEthers();
  // If it's a plain hex string, prefix it
  const prefixed = hash.startsWith('0x') ? hash : `0x${hash}`;
  // Pad to 32 bytes if needed
  return ethers.zeroPadValue(prefixed, 32);
}

// ─── Service ──────────────────────────────────────────────

export const web3Service = {
  /**
   * Check if Web3 integration is enabled
   */
  isEnabled,

  /**
   * Record a verified care visit on-chain.
   * Mints spendable hours to the provider and emits CareVerified event.
   *
   * Called fire-and-forget after Time Bank check-out.
   */
  async recordCareVisit(
    providerId: string,
    recipientId: string,
    hours: number,
    visitId: string,
  ): Promise<{ txHash?: string }> {
    if (!isEnabled()) {
      logger.debug({ visitId }, 'Web3 disabled — skipping care visit recording');
      return {};
    }

    try {
      const ethers = await getEthers();
      const contracts = await getContracts();

      // Convert hours to token amount (18 decimals)
      const amount = ethers.parseEther(hours.toString());

      // Use provider/recipient IDs as deterministic addresses for the on-chain record.
      // In production, these would map to actual wallet addresses from user profiles.
      const providerAddr = ethers.id(providerId).slice(0, 42);
      const recipientAddr = ethers.id(recipientId).slice(0, 42);

      // Mint spendable hours
      const mintTx = await contracts.careHourToken.mint(providerAddr, amount);
      await mintTx.wait();

      // Record the care visit event
      const eventTx = await contracts.careHourToken.recordCareVisit(
        providerAddr,
        recipientAddr,
        amount,
        visitId,
      );
      const receipt = await eventTx.wait();

      // Also mint prestige hours (1:1 with spendable for now)
      const prestigeTx = await contracts.careHourToken.mintPrestige(providerAddr, amount);
      await prestigeTx.wait();

      logger.info({ txHash: receipt.hash, visitId, hours }, 'Care visit recorded on-chain');

      return { txHash: receipt.hash };
    } catch (err) {
      logger.error({ err, visitId }, 'Failed to record care visit on-chain');
      return {};
    }
  },

  /**
   * Register a signed LMN document hash on-chain.
   * Called fire-and-forget after LMN signature completion.
   *
   * Only the hash goes on-chain — NO PHI.
   */
  async registerLMNOnChain(
    lmnId: string,
    documentHash: string,
    physicianAddress: string,
    expiresAt: Date,
  ): Promise<{ txHash?: string }> {
    if (!isEnabled()) {
      logger.debug({ lmnId }, 'Web3 disabled — skipping LMN on-chain registration');
      return {};
    }

    try {
      const ethers = await getEthers();
      const contracts = await getContracts();

      const hashBytes = await toBytes32(documentHash);
      // Use physician address or derive one from their ID
      const physAddr = ethers.isAddress(physicianAddress)
        ? physicianAddress
        : ethers.id(physicianAddress).slice(0, 42);

      const expiresAtUnix = Math.floor(expiresAt.getTime() / 1000);

      const tx = await contracts.credentialRegistry.registerLMN(hashBytes, physAddr, expiresAtUnix);
      const receipt = await tx.wait();

      logger.info({ txHash: receipt.hash, lmnId }, 'LMN registered on-chain');

      return { txHash: receipt.hash };
    } catch (err) {
      logger.error({ err, lmnId }, 'Failed to register LMN on-chain');
      return {};
    }
  },

  /**
   * Verify an LMN document hash on-chain (public, no auth needed).
   */
  async verifyLMN(
    documentHash: string,
  ): Promise<{ valid: boolean; physician?: string; timestamp?: number }> {
    if (!isEnabled()) {
      return { valid: false };
    }

    try {
      const contracts = await getContracts();
      const hashBytes = await toBytes32(documentHash);

      const [physician, timestamp, , valid] =
        await contracts.credentialRegistry.verifyLMN(hashBytes);

      return {
        valid: valid as boolean,
        physician: physician as string,
        timestamp: Number(timestamp),
      };
    } catch (err) {
      logger.error({ err, documentHash }, 'Failed to verify LMN on-chain');
      return { valid: false };
    }
  },

  /**
   * Grant a capability badge to a caregiver on-chain.
   */
  async grantCapabilityOnChain(
    caregiverId: string,
    capabilityName: string,
  ): Promise<{ txHash?: string }> {
    if (!isEnabled()) {
      logger.debug({ caregiverId }, 'Web3 disabled — skipping capability grant');
      return {};
    }

    try {
      const ethers = await getEthers();
      const contracts = await getContracts();

      const caregiverAddr = ethers.id(caregiverId).slice(0, 42);
      const capabilityHash = ethers.id(capabilityName);

      const tx = await contracts.credentialRegistry.grantCapability(
        caregiverAddr,
        capabilityHash,
        capabilityName,
      );
      const receipt = await tx.wait();

      logger.info(
        { txHash: receipt.hash, caregiverId, capabilityName },
        'Capability granted on-chain',
      );

      return { txHash: receipt.hash };
    } catch (err) {
      logger.error({ err, caregiverId, capabilityName }, 'Failed to grant capability on-chain');
      return {};
    }
  },

  /**
   * Create a governance proposal on-chain.
   */
  async createProposal(
    description: string,
    isBylawChange: boolean,
  ): Promise<{ proposalId?: number; txHash?: string }> {
    if (!isEnabled()) {
      logger.debug('Web3 disabled — skipping proposal creation');
      return {};
    }

    try {
      const contracts = await getContracts();

      const tx = await contracts.coopGovernance.propose(
        description,
        '0x', // no calldata for general proposals
        isBylawChange,
      );
      const receipt = await tx.wait();

      // Parse ProposalCreated event to get the ID
      const proposalCount: bigint = await contracts.coopGovernance.proposalCount();
      const proposalId = Number(proposalCount) - 1;

      logger.info(
        { txHash: receipt.hash, proposalId, isBylawChange },
        'Governance proposal created on-chain',
      );

      return { proposalId, txHash: receipt.hash };
    } catch (err) {
      logger.error({ err }, 'Failed to create proposal on-chain');
      return {};
    }
  },

  /**
   * Cast a vote on a governance proposal.
   */
  async castVote(proposalId: number, support: boolean): Promise<{ txHash?: string }> {
    if (!isEnabled()) {
      return {};
    }

    try {
      const contracts = await getContracts();

      const tx = await contracts.coopGovernance.vote(proposalId, support);
      const receipt = await tx.wait();

      logger.info({ txHash: receipt.hash, proposalId, support }, 'Vote cast on-chain');

      return { txHash: receipt.hash };
    } catch (err) {
      logger.error({ err, proposalId }, 'Failed to cast vote on-chain');
      return {};
    }
  },

  /**
   * Get on-chain profile for a user (prestige hours + capabilities).
   */
  async getOnChainProfile(userId: string): Promise<{
    prestigeHours: number;
    spendableHours: number;
    capabilities: Array<{ name: string; grantedAt: number }>;
  }> {
    if (!isEnabled()) {
      return { prestigeHours: 0, spendableHours: 0, capabilities: [] };
    }

    try {
      const ethers = await getEthers();
      const contracts = await getContracts();

      const userAddr = ethers.id(userId).slice(0, 42);

      const [prestige, balance, capData] = await Promise.all([
        contracts.careHourToken.prestigeOf(userAddr),
        contracts.careHourToken.balanceOf(userAddr),
        contracts.credentialRegistry.getCapabilities(userAddr),
      ]);

      const [, names, grantedAtArr] = capData as [unknown[], string[], bigint[]];

      const capabilities = names.map((name: string, i: number) => ({
        name,
        grantedAt: Number(grantedAtArr[i]),
      }));

      return {
        prestigeHours: Number(ethers.formatEther(prestige as bigint)),
        spendableHours: Number(ethers.formatEther(balance as bigint)),
        capabilities,
      };
    } catch (err) {
      logger.error({ err, userId }, 'Failed to get on-chain profile');
      return { prestigeHours: 0, spendableHours: 0, capabilities: [] };
    }
  },

  /**
   * List active governance proposals.
   */
  async listProposals(): Promise<
    Array<{
      id: number;
      proposer: string;
      description: string;
      isBylawChange: boolean;
      forVotes: number;
      againstVotes: number;
      createdAt: number;
      active: boolean;
    }>
  > {
    if (!isEnabled()) {
      return [];
    }

    try {
      const contracts = await getContracts();
      const count: bigint = await contracts.coopGovernance.proposalCount();
      const total = Number(count);
      const proposals = [];

      // Read the last 50 proposals at most
      const start = Math.max(0, total - 50);
      for (let i = start; i < total; i++) {
        const [id, proposer, description, , isBylawChange, forVotes, againstVotes, createdAt] =
          await contracts.coopGovernance.proposals(i);
        const active = await contracts.coopGovernance.isActive(i);

        proposals.push({
          id: Number(id),
          proposer: proposer as string,
          description: description as string,
          isBylawChange: isBylawChange as boolean,
          forVotes: Number(forVotes),
          againstVotes: Number(againstVotes),
          createdAt: Number(createdAt),
          active: active as boolean,
        });
      }

      return proposals;
    } catch (err) {
      logger.error({ err }, 'Failed to list proposals');
      return [];
    }
  },
};
