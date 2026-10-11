import { erc20Abi, toHex, type Address, type WalletClient } from "viem";

import { lookup } from "@/api/users";
import { toTokenAmount } from "@/lib/format";

import { crossWayAbi } from "./abi";
import { ARC, GAS, TOKENS } from "./arc";

export type ArcWallet = {
  address: Address | undefined;
  client: () => Promise<WalletClient>;
};

function tokenOf(symbol: string) {
  return symbol === "EURC" ? TOKENS.EURC : TOKENS.USDC;
}

function memoBytes(memo: string) {
  return memo ? toHex(memo) : "0x";
}

function expiry(days = 7) {
  return BigInt(Math.floor(Date.now() / 1000) + days * 86400);
}

function expiryAt(date?: string) {
  if (!date) return expiry(7);
  const t = Math.floor(new Date(`${date}T23:59:59`).getTime() / 1000);
  return Number.isFinite(t) ? BigInt(t) : expiry(7);
}

function sender(wallet: ArcWallet, client: WalletClient) {
  const account = client.account ?? wallet.address;
  if (!account) throw new Error("no account");
  return { account, chain: client.chain };
}

async function resolveWallet(value: string) {
  const v = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(v)) return v as Address;
  const found = await lookup({ q: v }).catch(() => null);
  if (!found?.wallet) throw new Error("user not found");
  return found.wallet as Address;
}

async function approve(wallet: ArcWallet, token: Address, amount: bigint) {
  const client = await wallet.client();
  await client.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [ARC.contract, amount],
    ...sender(wallet, client),
    ...GAS,
  });
}

async function exec(wallet: ArcWallet, functionName: "sendToAddress" | "createRequest" | "createLink" | "pay" | "cancel", args: readonly unknown[]) {
  const client = await wallet.client();
  return client.writeContract({
    address: ARC.contract,
    abi: crossWayAbi,
    functionName,
    args: args as never,
    ...sender(wallet, client),
    ...GAS,
  });
}

export async function sendPayment(wallet: ArcWallet, to: string, amount: string, symbol: string, memo: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  const dest = await resolveWallet(to);
  await approve(wallet, token.address, value);
  return exec(wallet, "sendToAddress", [dest, token.address, value, memoBytes(memo)]);
}

export async function createPaymentRequest(wallet: ArcWallet, from: string, amount: string, symbol: string, memo: string, expires?: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  const until = expiryAt(expires);
  if (!from.trim()) return exec(wallet, "createLink", [token.address, value, until, memoBytes(memo)]);
  return exec(wallet, "createRequest", [await resolveWallet(from), token.address, value, until, memoBytes(memo)]);
}

export async function createPaymentLink(wallet: ArcWallet, amount: string, symbol: string, memo: string, expires?: string) {
  const token = tokenOf(symbol);
  return exec(wallet, "createLink", [token.address, toTokenAmount(amount, token.decimals), expiryAt(expires), memoBytes(memo)]);
}

export async function payInvoice(wallet: ArcWallet, id: bigint, token: Address, amount: bigint) {
  await approve(wallet, token, amount);
  await exec(wallet, "pay", [id, "0x"]);
}

export async function cancelInvoice(wallet: ArcWallet, id: bigint) {
  await exec(wallet, "cancel", [id]);
}
