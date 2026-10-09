import { erc20Abi, isAddress, toHex, type Address, type WalletClient } from "viem";

import { lookup } from "@/api/users";
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

export async function sendPayment(wallet: ArcWallet, to: string, amount: string, symbol: string, memo: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  await approve(wallet, token.address, value);
  const client = await wallet.client();
  const from = sender(wallet, client);
  if (isAddress(to)) {
    await client.writeContract({
      address: ARC.contract,
      abi: crossWayAbi,
      functionName: "sendToAddress",
      args: [to, token.address, value, memoBytes(memo)],
      ...from,
      ...GAS,
    });
    return;
  }
  const found = await lookup(to.includes("@") ? { email: to } : { username: to.toLowerCase() }).catch(() =>
    lookup({ userId: to }).catch(() => null),
  );
  if (found?.wallet && isAddress(found.wallet)) {
    await client.writeContract({
      address: ARC.contract,
      abi: crossWayAbi,
      functionName: "sendToAddress",
      args: [found.wallet, token.address, value, memoBytes(memo)],
      ...from,
      ...GAS,
    });
    return;
  }
  const id = kindOf(to);
  await client.writeContract({
    address: ARC.contract,
    abi: crossWayAbi,
    functionName: "sendTo",
    args: [id.kind, id.value, token.address, value, expiry(), memoBytes(memo)],
    ...from,
    ...GAS,
  });
}

export async function createPaymentRequest(wallet: ArcWallet, from: string, amount: string, symbol: string, memo: string) {
  const token = tokenOf(symbol);
  const value = toTokenAmount(amount, token.decimals);
  const client = await wallet.client();
  const auth = sender(wallet, client);
  if (!from.trim()) {
    return client.writeContract({
      address: ARC.contract,
      abi: crossWayAbi,
      functionName: "createLink",
      args: [token.address, value, expiry(), memoBytes(memo)],
      ...auth,
      ...GAS,
    });
  }
  if (isAddress(from)) {
    return client.writeContract({
      address: ARC.contract,
      abi: crossWayAbi,
      functionName: "createRequest",
      args: [from, token.address, value, expiry(), memoBytes(memo)],
      ...auth,
      ...GAS,
    });
  }
  const id = kindOf(from);
  return client.writeContract({
    address: ARC.contract,
    abi: crossWayAbi,
    functionName: "createRequestTo",
    args: [id.kind, id.value, token.address, value, expiry(), memoBytes(memo)],
    ...auth,
    ...GAS,
  });
}

export async function createPaymentLink(wallet: ArcWallet, amount: string, symbol: string, memo: string, days = 7) {
  const token = tokenOf(symbol);
  const client = await wallet.client();
  return client.writeContract({
    address: ARC.contract,
    abi: crossWayAbi,
    functionName: "createLink",
    args: [token.address, toTokenAmount(amount, token.decimals), expiry(days), memoBytes(memo)],
    ...sender(wallet, client),
    ...GAS,
  });
}

export async function payInvoice(wallet: ArcWallet, id: bigint, token: Address, amount: bigint) {
  await approve(wallet, token, amount);
  const client = await wallet.client();
  await client.writeContract({
    address: ARC.contract,
    abi: crossWayAbi,
    functionName: "pay",
    args: [id, "0x"],
    ...sender(wallet, client),
    ...GAS,
  });
}
