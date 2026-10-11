import type { Address } from "viem";

import { ApiError, request } from "@/api/client";

export type ActivityItem = {
  id: string;
  hash: string;
  dir: "in" | "out";
  kind: string;
  counterparty: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  time: string;
  ts: number;
};

export type InvoiceRow = {
  id: string;
  amount: string;
  token: string;
  status: "Pending" | "Completed" | "Expired";
  time: string;
  counterparty: string;
};

export type Balances = { gas: string; usdc: string; eurc: string };

type WalletHome = { balances: Balances; activity: ActivityItem[]; invoices: InvoiceRow[] };

const inflight = new Map<string, Promise<WalletHome>>();
const memo = new Map<string, { at: number; data: WalletHome }>();

function loadWallet(wallet: Address, fresh = false) {
  const key = wallet.toLowerCase();
  if (!fresh) {
    const hit = memo.get(key);
    if (hit && Date.now() - hit.at < 8000) return Promise.resolve(hit.data);
    const pending = inflight.get(key);
    if (pending) return pending;
  }
  const p = request<WalletHome>(`/v1/wallets/${wallet}${fresh ? "?fresh=1" : ""}`).then((data) => {
    memo.set(key, { at: Date.now(), data });
    return data;
  });
  inflight.set(key, p);
  p.finally(() => inflight.delete(key));
  return p;
}

export async function loadBalances(wallet: Address) {
  return (await loadWallet(wallet)).balances;
}

export async function loadActivity(wallet: Address) {
  return (await loadWallet(wallet)).activity;
}

export async function loadMyInvoices(wallet: Address, fresh = false) {
  return (await loadWallet(wallet, fresh)).invoices;
}

export async function loadTx(hash: string, wallet: Address) {
  const rows = await loadActivity(wallet);
  return rows.find((row) => row.hash.toLowerCase() === hash.toLowerCase()) ?? null;
}

export async function loadInvoice(id: bigint) {
  try {
    const row = await request<{
      payee: Address;
      payer: Address;
      token: string;
      tokenAddress: Address;
      amount: string;
      rawAmount: string;
      expiresAt: number;
      memo: string;
      closed: boolean;
    }>(`/v1/invoices/${id}`);
    return { ...row, rawAmount: BigInt(row.rawAmount) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function invoiceIdFromTx(hash: string) {
  const row = await request<{ id: string | null }>(`/v1/tx/${hash}/invoice-id`);
  return row.id;
}

export async function waitInvoiceId(hash: string) {
  for (let i = 0; i < 20; i++) {
    const id = await invoiceIdFromTx(hash).catch(() => null);
    if (id) return id;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}
