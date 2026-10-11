import { defineChain } from "viem";

export const ARC = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.io",
  explorer: "https://explorer.testnet.arc.io",
  usdc: "0x3600000000000000000000000000000000000000" as const,
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const,
  contract: "0xf3a95153B5Da060EAC7B7c59D2cb37182f0f85d2" as const,
};

export const arcChain = defineChain({
  id: ARC.chainId,
  name: ARC.name,
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC.rpcUrl] } },
  blockExplorers: { default: { name: "Arc Explorer", url: ARC.explorer } },
});

export const TOKENS = {
  USDC: { symbol: "USDC", address: ARC.usdc, decimals: 6 },
  EURC: { symbol: "EURC", address: ARC.eurc, decimals: 6 },
} as const;

export const GAS = { maxFeePerGas: 20n * 10n ** 9n, maxPriorityFeePerGas: 20n * 10n ** 9n };
