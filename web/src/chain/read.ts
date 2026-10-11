import { decodeAbiParameters, hexToString, type Address, type Hex, zeroAddress } from "viem";

import { fromTokenAmount, shortTime } from "@/lib/format";

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
  hash: string;
  dir: "in" | "out";
  kind: string;
  counterparty: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  time: string;
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
        hash: row.transaction_hash,
        dir,
        kind: row.method || (dir === "out" ? "Sent" : "Received"),
        counterparty: dir === "out" ? to : from,
        from,
        to,
        amount: fromTokenAmount(BigInt(row.total?.value ?? "0"), decimals),
        token: row.token?.symbol ?? "USDC",
        time: shortTime(row.timestamp),
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
  let memo = "";
  const p = params(created);
  if (p.token || p.amount) {
    tokenAddr = ((p.token as Address) || tokenAddr) as Address;
    amount = BigInt(p.amount ?? "0");
    expiresAt = Number(p.expiresAt ?? 0);
    memo = p.memo ?? "";
  } else if (created.data && created.data !== "0x") {
    const decoded = decodeAbiParameters(
      [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }, { type: "uint64" }, { type: "bytes" }],
      created.data as `0x${string}`,
    );
    tokenAddr = decoded[1];
    amount = decoded[2];
    expiresAt = Number(decoded[3]);
    try {
      memo = hexToString(decoded[4] as Hex);
    } catch {
      memo = "";
    }
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
    memo,
    closed: cancelled || paid,
  };
}

export async function loadTx(hash: string, wallet: Address) {
  const rows = await loadActivity(wallet);
  return rows.find((row) => row.hash.toLowerCase() === hash.toLowerCase()) ?? null;
}

export type InvoiceRow = {
  id: string;
  amount: string;
  token: string;
  status: "Pending" | "Completed" | "Expired";
  time: string;
  counterparty: string;
};

export async function loadMyInvoices(wallet: Address): Promise<InvoiceRow[]> {
  const page = await scanGet<{ items?: ScanLog[] }>(`/addresses/${ARC.contract}/logs`);
  const logs = page.items ?? [];
  const me = wallet.toLowerCase().slice(2);
  const mine = logs.filter((item) => {
    const t = item.topics ?? [];
    return t[0]?.toLowerCase() === TOPICS.INVOICE_CREATED && (t[2] ?? "").toLowerCase().endsWith(me);
  });
  return mine.slice(0, 8).map((log) => {
    const id = BigInt(log.topics?.[1] ?? "0").toString();
    const padded = topicId(BigInt(id));
    const payer = (`0x${(log.topics?.[3] ?? "").slice(-40)}` as string) || "";
    let tokenAddr: Address = TOKENS.USDC.address;
    let amount = 0n;
    let expiresAt = 0;
    const p = params(log);
    if (p.amount) {
      tokenAddr = (p.token as Address) || tokenAddr;
      amount = BigInt(p.amount);
      expiresAt = Number(p.expiresAt ?? 0);
    } else if (log.data && log.data !== "0x") {
      const decoded = decodeAbiParameters(
        [{ type: "bytes32" }, { type: "address" }, { type: "uint256" }, { type: "uint64" }, { type: "bytes" }],
        log.data as `0x${string}`,
      );
      tokenAddr = decoded[1];
      amount = decoded[2];
      expiresAt = Number(decoded[3]);
    }
    const paid = logs.some((item) => {
      if (item.topics?.[0]?.toLowerCase() !== TOPICS.PAID) return false;
      const d = params(item);
      if (d.refId) return d.refId === id;
      if (!item.data || item.data === "0x") return false;
      const decoded = decodeAbiParameters(
        [{ type: "uint256" }, { type: "bytes32" }, { type: "uint8" }, { type: "uint256" }, { type: "bytes" }],
        item.data as `0x${string}`,
      );
      return decoded[3].toString() === id;
    });
    const cancelled = logs.some(
      (item) => item.topics?.[0]?.toLowerCase() === TOPICS.INVOICE_CANCELLED && item.topics?.[1]?.toLowerCase() === padded,
    );
    const expired = expiresAt > 0 && Date.now() / 1000 > expiresAt;
    const status: InvoiceRow["status"] = paid || cancelled ? "Completed" : expired ? "Expired" : "Pending";
    const token = tokenAddr.toLowerCase() === TOKENS.EURC.address.toLowerCase() ? "EURC" : "USDC";
    return {
      id,
      amount: fromTokenAmount(amount, 6),
      token,
      status,
      time: shortTime(log.timestamp),
      counterparty: payer,
    };
  });
}
