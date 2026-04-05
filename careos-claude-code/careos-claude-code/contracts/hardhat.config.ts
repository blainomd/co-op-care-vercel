import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const DEPLOYER_PRIVATE_KEY = process.env.WEB3_PRIVATE_KEY ?? "0x" + "00".repeat(32);
const RPC_URL = process.env.WEB3_RPC_URL ?? "http://127.0.0.1:8545";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    baseSepolia: {
      url: RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: RPC_URL,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 8453,
    },
  },
  paths: {
    sources: "./",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
