import { erc20Abi, isAddress, toHex, type Address, type Hex, type WalletClient } from "viem";

import { toTokenAmount } from "@/lib/format";

import { crossWayAbi } from "./abi";
import { ARC, GAS, KIND, TOKENS } from "./arc";

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

function kindOf(value: string) {
  if (value.includes("@")) return { kind: KIND.EMAIL, value: value.toLowerCase() };
  if (value.includes("-") || value.includes("_")) return { kind: KIND.USER_ID, value };
  return { kind: KIND.USERNAME, value: value.toLowerCase() };
}

function sender(wallet: ArcWallet, client: WalletClient) {
  const account = client.account ?? wallet.address;
  if (!account) throw new Error("no account");
  return { account, chain: client.chain };
}

function skipKey(wallet: string, kind: Hex, value: string) {
  return `cw:id:${wallet.toLowerCase()}:${kind}:${value.trim().toLowerCase()}`;
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

async function exec(wallet: ArcWallet, functionName: "register" | "sendToAddress" | "sendTo" | "createRequest" | "createRequestTo" | "createLink" | "pay" | "cancel", args: readonly unknown[]) {
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

export async function registerIdentity(wallet: ArcWallet, kind: Hex, value: string) {
  const v = kind === KIND.USER_ID ? value.trim() : value.trim().toLowerCase();
  if (!v || !wallet.address) return;
  const key = skipKey(wallet.address, kind, v);
  if (localStorage.getItem(key)) return;
  try {
    await exec(wallet, "register", [kind, v]);
    localStorage.setItem(key, "1");
  } catch (e) {
    if (/Taken/i.test(String(e))) localStorage.setItem(key, "1");
    else throw e;
  }
}

export async function syncIdentities(
  wallet: ArcWallet,
  profile: { email?: string | null; username?: string | null; user_id?: string | null },
) {
  if (profile.email) await registerIdentity(wallet, KIND.EMAIL, profile.email);
  if (profile.username) await registerIdentity(wallet, KIND.USERNAME, profile.username);
  if (profile.user_id) await registerIdentity(wallet, KIND.USER_ID, profile.user_id);
}

export async function sendPayment(wallet: ArcWallet, to: string, amount: string, symbol: string, memo: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  await approve(wallet, token.address, value);
  if (isAddress(to)) {
    await exec(wallet, "sendToAddress", [to, token.address, value, memoBytes(memo)]);
    return;
  }
  const id = kindOf(to);
  await exec(wallet, "sendTo", [id.kind, id.value, token.address, value, expiry(), memoBytes(memo)]);
}

export async function createPaymentRequest(wallet: ArcWallet, from: string, amount: string, symbol: string, memo: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  if (!from.trim()) {
    return exec(wallet, "createLink", [token.address, value, expiry(), memoBytes(memo)]);
  }
  if (isAddress(from)) {
    return exec(wallet, "createRequest", [from, token.address, value, expiry(), memoBytes(memo)]);
  }
  const id = kindOf(from);
  return exec(wallet, "createRequestTo", [id.kind, id.value, token.address, value, expiry(), memoBytes(memo)]);
}

export async function createPaymentLink(wallet: ArcWallet, amount: string, symbol: string, memo: string, days = 7) {
  const token = tokenOf(symbol);
  return exec(wallet, "createLink", [token.address, toTokenAmount(amount, token.decimals), expiry(days), memoBytes(memo)]);
}

export async function payInvoice(wallet: ArcWallet, id: bigint, token: Address, amount: bigint) {
  await approve(wallet, token, amount);
  await exec(wallet, "pay", [id, "0x"]);
}

export async function cancelInvoice(wallet: ArcWallet, id: bigint) {
  await exec(wallet, "cancel", [id]);
}
