import { defineChain } from "viem";

export const ARC = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.io",
  explorer: "https://explorer.testnet.arc.io",
  usdc: "0x3600000000000000000000000000000000000000" as const,
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const,
  contract: "0xA10c2Cb1C8CD60409d2322A2f532b7F03ee2B6fc" as const,
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
