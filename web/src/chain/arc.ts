import { defineChain, keccak256, stringToHex } from "viem";

export const ARC = {
  chainId: 5042002,
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.io",
  explorer: "https://explorer.testnet.arc.io",
  usdc: "0x3600000000000000000000000000000000000000" as const,
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const,
  contract: "0x069a2C2eD093308233e449409B1547F2a55060c7" as const,
};

export const arcChain = defineChain({
  id: ARC.chainId,
  name: ARC.name,
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: [ARC.rpcUrl] } },
  blockExplorers: { default: { name: "Arc Explorer", url: ARC.explorer } },
});

export const KIND = {
  USERNAME: keccak256(stringToHex("username")),
  EMAIL: keccak256(stringToHex("email")),
  USER_ID: keccak256(stringToHex("userid")),
} as const;

export const TOPICS = {
  INVOICE_CREATED: keccak256(stringToHex("InvoiceCreated(uint256,address,address,bytes32,address,uint256,uint64,bytes)")),
  INVOICE_CANCELLED: keccak256(stringToHex("InvoiceCancelled(uint256)")),
  PAID: keccak256(stringToHex("Paid(address,address,address,uint256,bytes32,uint8,uint256,bytes)")),
} as const;

export const TOKENS = {
  USDC: { symbol: "USDC", address: ARC.usdc, decimals: 6 },
  EURC: { symbol: "EURC", address: ARC.eurc, decimals: 6 },
} as const;

export const GAS = { maxFeePerGas: 20n * 10n ** 9n, maxPriorityFeePerGas: 20n * 10n ** 9n };
