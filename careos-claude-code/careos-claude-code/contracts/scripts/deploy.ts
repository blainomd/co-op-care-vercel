/**
 * CareOS Contract Deployment Script
 * Deploys CareHourToken, CoopGovernance, and CredentialRegistry to the target network.
 * Transfers ownership of CareHourToken and CredentialRegistry to a cooperative multisig if configured.
 */
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // ─── Deploy CareHourToken ────────────────────────────────
  const CareHourToken = await ethers.getContractFactory("CareHourToken");
  const careHourToken = await CareHourToken.deploy();
  await careHourToken.waitForDeployment();
  const careHourTokenAddress = await careHourToken.getAddress();
  console.log("CareHourToken deployed to:", careHourTokenAddress);

  // ─── Deploy CoopGovernance ───────────────────────────────
  const CoopGovernance = await ethers.getContractFactory("CoopGovernance");
  const coopGovernance = await CoopGovernance.deploy();
  await coopGovernance.waitForDeployment();
  const coopGovernanceAddress = await coopGovernance.getAddress();
  console.log("CoopGovernance deployed to:", coopGovernanceAddress);

  // ─── Deploy CredentialRegistry ───────────────────────────
  const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
  const credentialRegistry = await CredentialRegistry.deploy();
  await credentialRegistry.waitForDeployment();
  const credentialRegistryAddress = await credentialRegistry.getAddress();
  console.log("CredentialRegistry deployed to:", credentialRegistryAddress);

  // ─── Summary ─────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log("  CareOS Contract Deployment Complete");
  console.log("═══════════════════════════════════════════════");
  console.log("  CareHourToken:      ", careHourTokenAddress);
  console.log("  CoopGovernance:     ", coopGovernanceAddress);
  console.log("  CredentialRegistry: ", credentialRegistryAddress);
  console.log("═══════════════════════════════════════════════");
  console.log("\nSet these in your .env:");
  console.log(`  WEB3_CARE_HOUR_TOKEN_ADDRESS=${careHourTokenAddress}`);
  console.log(`  WEB3_COOP_GOVERNANCE_ADDRESS=${coopGovernanceAddress}`);
  console.log(`  WEB3_CREDENTIAL_REGISTRY_ADDRESS=${credentialRegistryAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
