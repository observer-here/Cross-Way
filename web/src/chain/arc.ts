import { defineChain } from "viem";

export const ARC = {
  chainId: 5042,
  name: "Arc Mainnet",
  rpcUrl: "https://rpc.mainnet.arc.io",
  explorer: "https://explorer.arc.io",
  usdc: "0x3600000000000000000000000000000000000000" as const,
  eurc: "0xbEf5f6d51CB62b58e6A8f77868681825C6fe21c1" as const,
  contract: "0x7574a58077eDaC8B48FD7D07B1dB16b8FB347c84" as const,
  feeTo: "0xA7b4c3A498B7FE206fCD3888bDe6b72264729f4a" as const,
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
