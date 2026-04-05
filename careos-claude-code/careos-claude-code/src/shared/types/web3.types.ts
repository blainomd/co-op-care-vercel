/**
 * co-op.care Web3 Architecture Types
 *
 * Bridges today's PostgreSQL TimeBank with the Web3 future:
 *   TODAY: PostgreSQL ledger + Opolis payroll + CMS billing
 *   YEAR 1: + Gnosis Safe treasury + Snapshot governance
 *   YEAR 2: + ERC-7818 time credits + smart contract settlement
 *   YEAR 3: + cross-city portability + tokenized patronage dividends
 *
 * Core contracts:
 *   CareHour.sol — ERC-20 + ERC-7818 expirable token (1 token = 0.25 hours)
 *   RespiteFund.sol — Auto-collect 10%, auto-approve ≤100hrs, governance >100hrs
 *   TaskAttestation.sol — Server oracle → token minting (90/10 split)
 *   Governance.sol — OpenZeppelin Governor for major decisions
 *
 * Hybrid architecture: PostgreSQL for operations, on-chain for settlement.
 * Chain: Polygon PoS or Base ($2-10/mo gas at 200 tx/week).
 *
 * Opolis $WORK token integration:
 *   Coalition Member stage → $WORK rewards for governance participation
 *   $WORK is NOT co-op.care's internal token — it's Opolis's ecosystem token
 *   co-op.care's internal token is CareHour (ERC-7818)
 */

// ============================================================
// CHAIN CONFIGURATION
// ============================================================

export type SupportedChain = 'polygon-pos' | 'base' | 'ethereum' | 'local';

export interface ChainConfig {
  chain: SupportedChain;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  /** Average gas cost per ERC-20 transfer in USD */
  avgTransferCostUSD: number;
  /** Whether this chain is recommended for co-op.care */
  recommended: boolean;
  notes: string;
}

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  'polygon-pos': {
    chain: 'polygon-pos',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    avgTransferCostUSD: 0.002,
    recommended: true,
    notes: 'Primary chain. $0.40-10/week at 200 tx/week. $21-520/year.',
  },
  base: {
    chain: 'base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    avgTransferCostUSD: 0.01,
    recommended: true,
    notes: 'Alternative. ~$2/week at 200 tx/week. $104/year.',
  },
  ethereum: {
    chain: 'ethereum',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    avgTransferCostUSD: 0.38,
    recommended: false,
    notes: 'Too expensive for operational use. Reserve for high-value settlement only.',
  },
  local: {
    chain: 'local',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    avgTransferCostUSD: 0,
    recommended: false,
    notes: 'Local Hardhat/Anvil for development and testing.',
  },
};

// ============================================================
// CAREHOUR TOKEN (ERC-20 + ERC-7818)
// ============================================================
// 1 CareHour token = 0.25 hours of care credit
// 12-month expiry via ERC-7818 epoch system
// FIFO spending (oldest credits first)
// Post-expiry: auto-transfer to Respite Fund contract

export interface CareHourToken {
  /** Token contract address */
  contractAddress: string;
  /** Token name */
  name: 'CareHour';
  /** Token symbol */
  symbol: 'CARE';
  /** Decimals (0 — tokens represent 0.25hr increments, no fractional tokens) */
  decimals: 0;
  /** Epoch duration in seconds (30 days) */
  epochDuration: number;
  /** Validity period in epochs (12 = 12 months) */
  validityPeriod: number;
  /** Hours per token */
  hoursPerToken: 0.25;
  /** Post-expiry behavior */
  postExpiryBehavior: 'transfer_to_respite_fund';
  /** Whether FIFO spending is enforced */
  fifoSpending: true;
}

export const CAREHOUR_TOKEN_CONFIG: CareHourToken = {
  contractAddress: '', // Set after deployment
  name: 'CareHour',
  symbol: 'CARE',
  decimals: 0,
  epochDuration: 2592000, // 30 days in seconds
  validityPeriod: 12, // 12 epochs = 12 months
  hoursPerToken: 0.25,
  postExpiryBehavior: 'transfer_to_respite_fund',
  fifoSpending: true,
};

// ============================================================
// TASK ATTESTATION (Server Oracle → On-Chain)
// ============================================================
// Off-chain: PostgreSQL validates GPS, computes hours, runs matching
// On-chain: Signed attestation posted → triggers token minting

export interface TaskAttestation {
  /** Attestation ID (hash of the attestation data) */
  attestationHash: string;
  /** Caregiver wallet address */
  caregiverAddress: string;
  /** Care recipient identifier (hashed for privacy) */
  recipientHash: string;
  /** Task completion timestamp (Unix epoch) */
  timestamp: number;
  /** Hours worked (in 0.25 increments) */
  hours: number;
  /** Tokens to mint for caregiver (90% of hours / 0.25) */
  caregiverTokens: number;
  /** Tokens to mint for Respite Fund (10% of hours / 0.25) */
  respiteFundTokens: number;
  /** GPS verification passed */
  gpsVerified: boolean;
  /** Server signature (ECDSA) */
  signature: string;
  /** PostgreSQL task ID for cross-reference */
  offChainTaskId: string;
  /** Whether attestation has been submitted on-chain */
  onChainSubmitted: boolean;
  /** Transaction hash (after on-chain submission) */
  txHash?: string;
  /** Block number (after confirmation) */
  blockNumber?: number;
}

// ============================================================
// RESPITE FUND (On-Chain Treasury)
// ============================================================

export interface RespiteFundState {
  /** Contract address */
  contractAddress: string;
  /** Total CareHour tokens in fund */
  totalTokens: number;
  /** Equivalent hours */
  totalHours: number;
  /** Auto-approve threshold (hours) — requests ≤ this are auto-approved */
  autoApproveThresholdHours: number;
  /** Emergency multi-sig override available */
  emergencyMultiSigEnabled: boolean;
  /** Number of active requests */
  activeRequests: number;
  /** Total hours distributed all-time */
  totalDistributedHours: number;
}

export interface RespiteFundRequest {
  /** Request ID */
  id: string;
  /** Requester wallet address */
  requesterAddress: string;
  /** Hours requested */
  hoursRequested: number;
  /** Reason for request */
  reason: string;
  /** Whether this is an emergency request */
  isEmergency: boolean;
  /** Status */
  status: 'pending' | 'auto_approved' | 'governance_vote' | 'approved' | 'rejected' | 'distributed';
  /** Governance proposal ID (if > auto-approve threshold) */
  governanceProposalId?: string;
  /** ISO 8601 timestamps */
  createdAt: string;
  resolvedAt?: string;
}

// ============================================================
// GNOSIS SAFE (Treasury Management)
// ============================================================
// Day 1 DAO tool: 3-of-5 multisig for treasury management.
// Any expenditure >$500 needs 3 of 5 board member signatures.

export interface GnosisSafeConfig {
  /** Safe contract address */
  safeAddress: string;
  /** Chain deployed on */
  chain: SupportedChain;
  /** Number of owners */
  ownerCount: number;
  /** Required confirmations for transactions */
  threshold: number;
  /** Owner addresses (board members) */
  owners: SafeOwner[];
  /** Expenditure threshold for safe requirement (in cents) */
  expenditureThresholdCents: number;
}

export interface SafeOwner {
  /** Wallet address */
  address: string;
  /** Board member name */
  name: string;
  /** Board seat category */
  category: 'caregiver' | 'care_recipient' | 'family_member' | 'independent' | 'community';
}

// ============================================================
// SNAPSHOT GOVERNANCE
// ============================================================
// Gasless off-chain voting for major decisions.
// 3-5 votes per year. Multi-stakeholder spaces.

export interface SnapshotConfig {
  /** Snapshot space ID */
  spaceId: string;
  /** Voting strategy */
  votingStrategy: 'quadratic' | 'weighted' | 'single-choice';
  /** Voting period in hours */
  votingPeriodHours: number;
  /** Proposal threshold (minimum tokens to create proposal) */
  proposalThreshold: number;
  /** Quorum (minimum participation for valid vote) */
  quorumPercent: number;
}

export type GovernanceVoteType =
  | 'annual_budget'
  | 'service_area_expansion'
  | 'pricing_change'
  | 'board_election'
  | 'respite_fund_large_request'
  | 'policy_amendment';

export interface GovernanceProposal {
  /** Proposal ID */
  id: string;
  /** Proposal type */
  type: GovernanceVoteType;
  /** Title */
  title: string;
  /** Description */
  description: string;
  /** Proposer */
  proposerAddress: string;
  /** Proposer name */
  proposerName: string;
  /** Options */
  options: string[];
  /** Current vote counts per option */
  voteCounts: number[];
  /** Status */
  status: 'draft' | 'active' | 'passed' | 'failed' | 'executed';
  /** Snapshot block (for vote weight determination) */
  snapshotBlock?: number;
  /** ISO 8601 timestamps */
  createdAt: string;
  votingStartsAt: string;
  votingEndsAt: string;
  executedAt?: string;
}

// ============================================================
// OPOLIS $WORK TOKEN INTEGRATION
// ============================================================
// $WORK is Opolis's ecosystem token — NOT co-op.care's token.
// co-op.care earns $WORK as a Coalition Member:
//   - Governance participation rewards
//   - Staking for improved benefits rates
//   - Cross-cooperative reputation signals
//
// co-op.care's OWN token is CareHour (ERC-7818).
// The two tokens serve different purposes:
//   $WORK → Opolis ecosystem governance & rewards
//   CARE → co-op.care TimeBank credit representation

export interface OpolisWorkTokenIntegration {
  /** Whether $WORK rewards are active */
  active: boolean;
  /** Coalition Member status */
  coalitionMember: boolean;
  /** Total $WORK earned by co-op.care */
  totalWorkTokensEarned: number;
  /** $WORK staked for benefits optimization */
  workTokensStaked: number;
  /** Reward events */
  rewardEvents: WorkTokenRewardEvent[];
}

export interface WorkTokenRewardEvent {
  /** Event type */
  type: WorkTokenEventType;
  /** $WORK tokens earned */
  tokensEarned: number;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Description */
  description: string;
}

export type WorkTokenEventType =
  | 'governance_vote' // Voted on Opolis governance proposal
  | 'member_onboarding' // Onboarded new worker to Opolis
  | 'payroll_milestone' // Payroll processing milestone
  | 'coalition_participation' // Active Coalition Member participation
  | 'staking_reward'; // Staking yield

// ============================================================
// HYBRID ARCHITECTURE — Off-Chain ↔ On-Chain Bridge
// ============================================================
// PostgreSQL handles: GPS, disputes, matching, task lifecycle, billing
// Blockchain handles: balances, expiry, respite fund, governance, settlement

export type SettlementFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly';

export interface HybridBridgeConfig {
  /** How often off-chain → on-chain settlement occurs */
  settlementFrequency: SettlementFrequency;
  /** Whether Merkle root batching is used */
  merkleRootBatching: boolean;
  /** Number of attestations per batch */
  batchSize: number;
  /** Whether individual members can verify their transactions */
  merkleProofVerification: boolean;
  /** Oracle configuration */
  oracle: {
    /** Oracle type (server = centralized, multi-sig = semi-decentralized) */
    type: 'server' | 'multi-sig';
    /** Required attestation sources for 2-of-3 verification */
    requiredSources: number;
    /** Available attestation sources */
    sources: ('caregiver_gps' | 'family_confirmation' | 'server_validation')[];
  };
}

export const DEFAULT_HYBRID_BRIDGE: HybridBridgeConfig = {
  settlementFrequency: 'daily',
  merkleRootBatching: true,
  batchSize: 50,
  merkleProofVerification: true,
  oracle: {
    type: 'server',
    requiredSources: 1, // Start centralized, move to 2-of-3 at scale
    sources: ['caregiver_gps', 'family_confirmation', 'server_validation'],
  },
};

// ============================================================
// PROGRESSIVE DECENTRALIZATION PHASES
// ============================================================

export type DecentralizationPhase =
  | 'centralized' // Today: PostgreSQL only, Opolis payroll
  | 'treasury_multisig' // Month 4: + Gnosis Safe for treasury
  | 'governance_voting' // Month 6: + Snapshot for major decisions
  | 'token_settlement' // Month 12: + ERC-7818 on-chain balances
  | 'full_hybrid' // Month 18: AI agents → smart contracts
  | 'federated'; // Month 24: Cross-city credit portability

export interface DecentralizationMilestone {
  phase: DecentralizationPhase;
  label: string;
  targetMonth: number;
  prerequisites: string[];
  tools: string[];
  memberThreshold: number;
  status: 'completed' | 'active' | 'planned';
}

export const DECENTRALIZATION_ROADMAP: readonly DecentralizationMilestone[] = [
  {
    phase: 'centralized',
    label: 'Centralized Operations',
    targetMonth: 0,
    prerequisites: [],
    tools: ['PostgreSQL', 'Opolis payroll', 'CareOS web app'],
    memberThreshold: 0,
    status: 'active',
  },
  {
    phase: 'treasury_multisig',
    label: 'Treasury Multisig',
    targetMonth: 4,
    prerequisites: ['Board member wallet addresses (5)', 'Polygon/Base node access'],
    tools: ['Gnosis Safe (3-of-5 multisig)'],
    memberThreshold: 10,
    status: 'planned',
  },
  {
    phase: 'governance_voting',
    label: 'Governance Voting',
    targetMonth: 6,
    prerequisites: ['Gnosis Safe deployed', 'ENS or custom Snapshot space'],
    tools: ['Snapshot', 'Multi-stakeholder voting spaces'],
    memberThreshold: 30,
    status: 'planned',
  },
  {
    phase: 'token_settlement',
    label: 'On-Chain Token Settlement',
    targetMonth: 12,
    prerequisites: ['Smart contract audit ($20-45K)', 'ERC-7818 finalized'],
    tools: ['CareHour.sol', 'TaskAttestation.sol', 'RespiteFund.sol'],
    memberThreshold: 50,
    status: 'planned',
  },
  {
    phase: 'full_hybrid',
    label: 'AI + Smart Contract Integration',
    targetMonth: 18,
    prerequisites: ['All 5 AI agents operational', 'Smart contracts on mainnet'],
    tools: ['LangGraph agents → signed attestations → smart contracts'],
    memberThreshold: 100,
    status: 'planned',
  },
  {
    phase: 'federated',
    label: 'Federated Cross-City',
    targetMonth: 24,
    prerequisites: ['Multiple co-op.care instances', 'Cross-city credit protocol'],
    tools: ['Federation bridge contract', 'Quadratic voting', 'Delegation'],
    memberThreshold: 200,
    status: 'planned',
  },
] as const;

// ============================================================
// TOKENIZED PATRONAGE DIVIDENDS (Year 2+)
// ============================================================
// Smart contract auto-calculates and distributes patronage dividends.
// Replaces manual calculation in federation.types.ts at scale.

export interface TokenizedPatronageDividend {
  /** Fiscal year */
  fiscalYear: number;
  /** Smart contract transaction hash */
  txHash: string;
  /** Total net surplus distributed (in CareHour tokens) */
  totalSurplusTokens: number;
  /** Total members receiving dividends */
  totalRecipients: number;
  /** Distribution events */
  distributions: {
    memberAddress: string;
    /** Cash portion (stablecoin transfer) */
    cashTokens: number;
    /** Retained equity portion (locked in vesting contract) */
    retainedTokens: number;
    /** Vesting unlock date */
    vestingUnlockDate: string;
  }[];
  /** Block number of distribution */
  blockNumber: number;
  /** ISO 8601 timestamp */
  distributedAt: string;
}

// ============================================================
// WEB3 + AI SAFETY LAYER
// ============================================================
// Smart contracts enforce what the Colorado AI Act requires but
// traditional systems can't guarantee: tamper-proof audit trails,
// automated safety pauses, decentralized dispute resolution.
//
// Six mechanisms bridge Web3 infrastructure to AI governance:
//   1. Automated Clinical Oversight — smart contract safety gates
//   2. Immutable Audit Trails — on-chain AI decision logging
//   3. Decentralized Insurance — DAO mutual risk pools
//   4. Parametric Payouts — auto-trigger on AI accuracy drops
//   5. Decentralized Dispute Resolution — Kleros-style arbitration
//   6. Privacy-Preserving Verification — ZKP for HIPAA compliance

// ─── 1. Automated Clinical Oversight ─────────────────────────
// Smart contracts as an enforceability layer that prevents
// autonomous AI mistakes. High-risk actions are paused until
// human clinician verification. ~99.8% audit log completeness
// vs. ~80% in traditional systems.

export interface ClinicalOversightContract {
  /** Contract address */
  contractAddress: string;
  /** Safety thresholds that trigger automatic pause */
  safetyThresholds: ClinicalSafetyThreshold[];
  /** Whether the oversight contract is active */
  active: boolean;
  /** Clinician addresses authorized to approve paused actions */
  authorizedClinicians: string[];
  /** Current pause state */
  paused: boolean;
  /** Total actions reviewed */
  totalActionsReviewed: number;
  /** Actions paused for human review */
  actionsPaused: number;
  /** Audit log completeness percentage */
  auditLogCompleteness: number;
}

export interface ClinicalSafetyThreshold {
  /** What AI action this threshold governs */
  actionType: AIActionType;
  /** Confidence score below which action is paused for review */
  confidenceFloor: number;
  /** Maximum risk score before automatic pause */
  maxRiskScore: number;
  /** Whether human override is required regardless of confidence */
  alwaysRequireHuman: boolean;
  /** Cooldown period in seconds after a pause before auto-resume */
  cooldownSeconds: number;
}

export type AIActionType =
  | 'scheduling_assignment' // AI assigns caregiver to family
  | 'risk_score_alert' // AI flags risk level change
  | 'billing_code_selection' // AI selects CMS billing code
  | 'medication_reconciliation' // AI suggests medication changes
  | 'care_plan_modification' // AI modifies care plan
  | 'compliance_determination' // AI makes compliance assessment
  | 'nlp_omaha_coding' // NLP auto-codes Omaha System
  | 'respite_fund_distribution'; // AI approves respite request

// ─── 2. Immutable Audit Trails ───────────────────────────────
// Blockchain records AI model versions, input datasets,
// clinician interactions. Cryptographic proof of the decision
// chain. +68% auditability vs. centralized logs.

export interface AIAuditEntry {
  /** On-chain entry hash */
  entryHash: string;
  /** AI agent that made the decision */
  agentId: string;
  /** AI model version (e.g., "claude-sonnet-4.6-20260301") */
  modelVersion: string;
  /** Hash of input data (not the data itself — HIPAA compliance) */
  inputDataHash: string;
  /** Decision output hash */
  outputHash: string;
  /** Confidence score of the AI decision (0-1) */
  confidence: number;
  /** Whether a human clinician reviewed/approved */
  humanReviewed: boolean;
  /** Clinician wallet address (if reviewed) */
  reviewerAddress?: string;
  /** Action taken after review */
  actionTaken: 'approved' | 'modified' | 'rejected' | 'auto_approved';
  /** Block number */
  blockNumber: number;
  /** Transaction hash */
  txHash: string;
  /** Unix timestamp */
  timestamp: number;
}

// ─── 3. Decentralized Insurance / Mutual Risk Pool ───────────
// DAO-managed mutual insurance pool for AI malpractice risk.
// Smart contracts automate premium collection and claim settlement.
// Excess premiums returned to members — aligns financial incentives
// with safety outcomes.

export interface MutualRiskPool {
  /** Contract address */
  contractAddress: string;
  /** Total pool balance in stablecoin (cents) */
  poolBalanceCents: number;
  /** Monthly premium per worker-owner (cents) */
  monthlyPremiumCents: number;
  /** Number of contributing members */
  contributingMembers: number;
  /** Active claims count */
  activeClaims: number;
  /** Total claims paid all-time (cents) */
  totalClaimsPaidCents: number;
  /** Excess premium return percentage (end-of-year refund) */
  excessReturnPercent: number;
  /** Coverage types */
  coverageTypes: InsuranceCoverageType[];
  /** Governance: who approves claims */
  claimApproval: 'dao_vote' | 'multisig' | 'parametric_auto';
}

export type InsuranceCoverageType =
  | 'ai_malpractice' // AI makes an error in care
  | 'scheduling_failure' // AI scheduling causes harm
  | 'data_breach' // AI-related data exposure
  | 'billing_error' // AI billing miscalculation
  | 'clinical_protocol_deviation'; // AI deviates from protocol

// ─── 4. Parametric Payouts ───────────────────────────────────
// Auto-trigger claims based on objective data — no lengthy
// manual investigation. An AI accuracy oracle monitors
// performance; payout triggers if accuracy drops below threshold.

export interface ParametricInsurancePolicy {
  /** Policy ID */
  id: string;
  /** Contract address */
  contractAddress: string;
  /** What metric triggers the payout */
  triggerMetric: ParametricTrigger;
  /** Threshold value — payout triggers when metric crosses this */
  threshold: number;
  /** Payout amount in stablecoin (cents) */
  payoutCents: number;
  /** Oracle that monitors the metric */
  oracleType: 'chainlink' | 'internal_accuracy' | 'cms_audit';
  /** Cooldown between consecutive payouts (seconds) */
  payoutCooldownSeconds: number;
  /** Whether policy is active */
  active: boolean;
}

export type ParametricTrigger =
  | 'ai_accuracy_drop' // AI model accuracy falls below threshold
  | 'false_positive_rate' // False positive rate exceeds limit
  | 'scheduling_miss_rate' // Scheduling failures exceed threshold
  | 'billing_rejection_rate' // CMS claim rejection rate spikes
  | 'anomaly_detection_miss'; // Missed critical health anomaly

// ─── 5. Decentralized Dispute Resolution ─────────────────────
// Kleros-style arbitration for technical or medical disputes.
// Crowdsourced specialized jurors incentivized by game theory
// to rule correctly. Faster + more transparent than litigation.

export interface DisputeResolutionConfig {
  /** Platform used (Kleros, Aragon Court, internal) */
  platform: 'kleros' | 'aragon_court' | 'internal_board';
  /** Dispute categories handled on-chain */
  categories: DisputeCategory[];
  /** Minimum stake to file a dispute (cents) */
  filingStakeCents: number;
  /** Number of jurors per dispute */
  jurorsPerDispute: number;
  /** Appeal rounds allowed */
  maxAppeals: number;
  /** Average resolution time in days */
  avgResolutionDays: number;
}

export type DisputeCategory =
  | 'ai_care_decision' // AI made a questionable care recommendation
  | 'timebank_discrepancy' // Dispute over TimeBank credit calculation
  | 'gps_verification_failure' // GPS verification challenged
  | 'billing_dispute' // CMS billing code selection challenged
  | 'caregiver_matching' // Match quality disputed
  | 'respite_fund_denial'; // Respite Fund request denied

export interface Dispute {
  /** Dispute ID */
  id: string;
  /** Category */
  category: DisputeCategory;
  /** Claimant (wallet address or member ID) */
  claimantAddress: string;
  /** Respondent */
  respondentAddress: string;
  /** Evidence hashes (stored off-chain, hash on-chain) */
  evidenceHashes: string[];
  /** Ruling */
  ruling?: 'claimant_wins' | 'respondent_wins' | 'split' | 'dismissed';
  /** Status */
  status:
    | 'filed'
    | 'evidence_period'
    | 'jury_selection'
    | 'deliberation'
    | 'ruling'
    | 'appeal'
    | 'final';
  /** Juror addresses */
  jurors: string[];
  /** ISO 8601 timestamps */
  filedAt: string;
  resolvedAt?: string;
}

// ─── 6. Privacy-Preserving Verification (ZKP) ───────────────
// Zero-Knowledge Proofs allow co-op.care to prove:
//   - Clinical protocol was followed (without revealing PHI)
//   - AI model weights are un-tampered (without exposing weights)
//   - Care was delivered at correct location (without exact GPS)
//   - Billing codes are justified (without patient details)
// Ensures HIPAA-grade privacy while enabling on-chain verification.

export interface ZKPVerificationConfig {
  /** ZKP system used */
  system: 'groth16' | 'plonk' | 'stark' | 'circom';
  /** Verification circuits deployed */
  circuits: ZKPCircuit[];
  /** Whether ZKP verification is production-ready */
  productionReady: boolean;
  /** Average proof generation time (milliseconds) */
  avgProofTimeMs: number;
  /** Notes on maturity */
  notes: string;
}

export interface ZKPCircuit {
  /** Circuit name */
  name: string;
  /** What it proves */
  proves: string;
  /** What it keeps private */
  privateInputs: string[];
  /** What is publicly verifiable */
  publicOutputs: string[];
  /** Deployment status */
  status: 'research' | 'development' | 'testnet' | 'production';
}

export const ZKP_CIRCUITS: readonly ZKPCircuit[] = [
  {
    name: 'CareProtocolCompliance',
    proves: 'Clinical protocol was followed for a specific care visit',
    privateInputs: ['patient_id', 'diagnosis', 'care_plan_details', 'clinician_notes'],
    publicOutputs: ['protocol_followed: boolean', 'protocol_version_hash', 'timestamp'],
    status: 'research',
  },
  {
    name: 'LocationProximity',
    proves: 'Caregiver was within 0.25 miles of care recipient at check-in',
    privateInputs: ['exact_gps_coordinates', 'caregiver_id', 'recipient_address'],
    publicOutputs: ['within_range: boolean', 'timestamp', 'attestation_hash'],
    status: 'research',
  },
  {
    name: 'ModelIntegrity',
    proves: 'AI model weights have not been tampered with since last audit',
    privateInputs: ['model_weights', 'training_data_hash', 'hyperparameters'],
    publicOutputs: ['weights_hash_matches_audit: boolean', 'model_version', 'audit_date'],
    status: 'research',
  },
  {
    name: 'BillingJustification',
    proves: 'CMS billing code is supported by sufficient clinical documentation',
    privateInputs: ['patient_chart', 'diagnosis_codes', 'care_minutes', 'clinician_attestation'],
    publicOutputs: ['billing_code', 'justified: boolean', 'documentation_completeness_score'],
    status: 'research',
  },
] as const;

// ─── AI Safety Constants ─────────────────────────────────────

export const AI_SAFETY_CONSTANTS = {
  /** Clinical oversight: default confidence floor for auto-approval */
  DEFAULT_CONFIDENCE_FLOOR: 0.85,
  /** Clinical oversight: max risk score before mandatory pause */
  DEFAULT_MAX_RISK_SCORE: 75,
  /** Audit trail: target completeness percentage */
  TARGET_AUDIT_COMPLETENESS: 99.8,
  /** Traditional system audit completeness (baseline comparison) */
  TRADITIONAL_AUDIT_COMPLETENESS: 80,
  /** Auditability improvement from blockchain (+68%) */
  AUDITABILITY_IMPROVEMENT_PERCENT: 68,
  /** Mutual risk pool: target excess return percentage */
  TARGET_EXCESS_RETURN_PERCENT: 15,
  /** Parametric insurance: AI accuracy floor before payout triggers */
  AI_ACCURACY_PAYOUT_THRESHOLD: 0.92,
  /** Dispute resolution: Kleros average cost per dispute */
  KLEROS_AVG_COST_CENTS: 25000, // ~$250
  /** ZKP: current avg proof time (research stage) */
  ZKP_AVG_PROOF_TIME_MS: 120000, // ~2 minutes (not production-ready)
  /** ZKP: target proof time for production */
  ZKP_TARGET_PROOF_TIME_MS: 5000, // 5 seconds
} as const;

// ============================================================
// WEB3 CONSTANTS
// ============================================================

export const WEB3_CONSTANTS = {
  /** CareHour token: hours per token */
  HOURS_PER_TOKEN: 0.25,
  /** CareHour token: tokens per hour */
  TOKENS_PER_HOUR: 4,
  /** ERC-7818 epoch duration in seconds (30 days) */
  EPOCH_DURATION_SECONDS: 2592000,
  /** ERC-7818 validity period in epochs (12 months) */
  VALIDITY_EPOCHS: 12,
  /** Respite Fund: auto-approve threshold in hours */
  RESPITE_AUTO_APPROVE_HOURS: 100,
  /** Gnosis Safe: minimum signatures required */
  GNOSIS_SAFE_THRESHOLD: 3,
  /** Gnosis Safe: total owners */
  GNOSIS_SAFE_OWNERS: 5,
  /** Gnosis Safe: expenditure threshold for safe requirement (cents) */
  GNOSIS_EXPENDITURE_THRESHOLD_CENTS: 50000, // $500
  /** Snapshot: voting period in hours */
  SNAPSHOT_VOTING_HOURS: 168, // 7 days
  /** Snapshot: quorum percentage */
  SNAPSHOT_QUORUM_PERCENT: 30,
  /** Smart contract audit budget range in cents */
  AUDIT_BUDGET_MIN_CENTS: 2000000, // $20,000
  AUDIT_BUDGET_MAX_CENTS: 4500000, // $45,000
  /** Recommended chain */
  RECOMMENDED_CHAIN: 'polygon-pos' as SupportedChain,
  /** Annual gas cost estimate at 200 tx/week (cents) */
  ANNUAL_GAS_ESTIMATE_CENTS: {
    'polygon-pos': { min: 2100, max: 52000 },
    base: { min: 10400, max: 10400 },
    ethereum: { min: 395200, max: 395200 },
  },
} as const;
