import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import type { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {},
    arc: {
      url: process.env.ARC_RPC_URL || "https://rpc.mainnet.arc.io",
      chainId: 5042,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: { sources: "./src", tests: "./tests" },
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 800 } },
  },
};

export default config;
