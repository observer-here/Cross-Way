import { decodeAbiParameters, type Address, zeroAddress } from "viem";

import { fromTokenAmount } from "@/lib/format";

import { ARC, TOKENS, TOPICS } from "./arc";
import { scanGet } from "./scan";

type ScanAddress = { coin_balance?: string };
type ScanTokenBal = { value?: string; token?: { address_hash?: string; symbol?: string; decimals?: string } };
type ScanTransfer = {
  transaction_hash: string;
  timestamp?: string;
  method?: string | null;
  from?: { hash?: string };
  to?: { hash?: string };
  token?: { address_hash?: string; symbol?: string; decimals?: string };
  total?: { value?: string; decimals?: string };
};
type ScanLog = {
  transaction_hash?: string;
  timestamp?: string;
  data?: string;
  topics?: string[];
  decoded?: { method_call?: string; parameters?: { name: string; value: string }[] };
};

export async function loadBalances(wallet: Address) {
  const [acct, tokens] = await Promise.all([
    scanGet<ScanAddress>(`/addresses/${wallet}`),
    scanGet<ScanTokenBal[]>(`/addresses/${wallet}/token-balances`),
  ]);
  const list = Array.isArray(tokens) ? tokens : [];
  const pick = (addr: string) => list.find((t) => t.token?.address_hash?.toLowerCase() === addr.toLowerCase());
  const usdc = pick(TOKENS.USDC.address);
  const eurc = pick(TOKENS.EURC.address);
  return {
    gas: fromTokenAmount(BigInt(acct.coin_balance ?? "0"), 18),
    usdc: fromTokenAmount(BigInt(usdc?.value ?? "0"), Number(usdc?.token?.decimals ?? 6)),
    eurc: fromTokenAmount(BigInt(eurc?.value ?? "0"), Number(eurc?.token?.decimals ?? 6)),
  };
}

export type ActivityItem = {
  id: string;
  dir: "in" | "out";
  kind: string;
  counterparty: string;
  amount: string;
  token: string;
  time: string;
  method: number;
};

const wanted = new Set([TOKENS.USDC.address.toLowerCase(), TOKENS.EURC.address.toLowerCase()]);

export async function loadActivity(wallet: Address): Promise<ActivityItem[]> {
  const page = await scanGet<{ items?: ScanTransfer[] }>(`/addresses/${wallet}/token-transfers`);
  const me = wallet.toLowerCase();
  return (page.items ?? [])
    .filter((row) => wanted.has(row.token?.address_hash?.toLowerCase() ?? ""))
    .slice(0, 20)
    .map((row) => {
      const from = row.from?.hash ?? "";
      const to = row.to?.hash ?? "";
      const dir = from.toLowerCase() === me ? "out" : "in";
      const decimals = Number(row.total?.decimals ?? row.token?.decimals ?? 6);
      return {
        id: `${row.transaction_hash}-${from}-${to}`,
        dir,
        kind: row.method || (dir === "out" ? "Sent" : "Received"),
        counterparty: dir === "out" ? to : from,
        amount: fromTokenAmount(BigInt(row.total?.value ?? "0"), decimals),
        token: row.token?.symbol ?? "USDC",
        time: row.timestamp ? new Date(row.timestamp).toLocaleString() : "",
        method: 0,
      };
    });
}

function topicId(id: bigint) {
  return `0x${id.toString(16).padStart(64, "0")}`;
}

function params(log: ScanLog) {
  return Object.fromEntries((log.decoded?.parameters ?? []).map((x) => [x.name, x.value]));
}

export async function invoiceIdFromTx(hash: string) {
  const page = await scanGet<{ items?: ScanLog[] }>(`/transactions/${hash}/logs`);
  const log = (page.items ?? []).find((item) => item.topics?.[0]?.toLowerCase() === TOPICS.INVOICE_CREATED);
  if (!log?.topics?.[1]) return null;
  return BigInt(log.topics[1]).toString();
}

export async function waitInvoiceId(hash: string) {
  for (let i = 0; i < 20; i++) {
    const id = await invoiceIdFromTx(hash).catch(() => null);
    if (id) return id;
    await new Promise((r) => setTimeout(r, 1500));
  }
  return null;
}

export async function loadInvoice(id: bigint) {
  const page = await scanGet<{ items?: ScanLog[] }>(`/addresses/${ARC.contract}/logs`);
  const padded = topicId(id);
  const logs = page.items ?? [];
  const created = logs.find((item) => {
    const topics = item.topics ?? [];
    return topics[0]?.toLowerCase() === TOPICS.INVOICE_CREATED && topics[1]?.toLowerCase() === padded;
  });
  if (!created) return null;
  const topics = created.topics ?? [];
  const payee = (`0x${(topics[2] ?? "").slice(-40)}` as Address) || zeroAddress;
  const payer = (`0x${(topics[3] ?? "").slice(-40)}` as Address) || zeroAddress;
  let tokenAddr = TOKENS.USDC.address as Address;
  let amount = 0n;
  let expiresAt = 0;
  const p = params(created);
  if (p.token || p.amount) {
    tokenAddr = ((p.token as Address) || tokenAddr) as Address;
    amount = BigInt(p.amount ?? "0");
    expiresAt = Number(p.expiresAt ?? 0);
  } else if (created.data && created.data !== "0x") {
    const decoded = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }, { type: "uint64" }, { type: "bytes" }],
      created.data as `0x${string}`,
    );
    tokenAddr = decoded[1];
    amount = decoded[2];
    expiresAt = Number(decoded[3]);
  }
  if (payee === zeroAddress) return null;
  const cancelled = logs.some(
    (item) => item.topics?.[0]?.toLowerCase() === TOPICS.INVOICE_CANCELLED && item.topics?.[1]?.toLowerCase() === padded,
  );
  const paid = logs.some((item) => {
    if (item.topics?.[0]?.toLowerCase() !== TOPICS.PAID) return false;
    const d = params(item);
    if (d.refId && d.method) return d.refId === id.toString() && (d.method === "1" || d.method === "2");
    if (!item.data || item.data === "0x") return false;
    const decoded = decodeAbiParameters(
      [{ type: "uint256" }, { type: "bytes32" }, { type: "uint8" }, { type: "uint256" }, { type: "bytes" }],
      item.data as `0x${string}`,
    );
    return decoded[3] === id && (decoded[2] === 1 || decoded[2] === 2);
  });
  const token = tokenAddr.toLowerCase() === TOKENS.EURC.address.toLowerCase() ? "EURC" : "USDC";
  return {
    payee,
    payer,
    token,
    tokenAddress: tokenAddr,
    amount: fromTokenAmount(amount, 6),
    rawAmount: amount,
    expiresAt,
    closed: cancelled || paid,
  };
}
