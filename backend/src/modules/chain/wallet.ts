import type { Env } from "../../env";

import { scanGet } from "./scan";

const TOPICS = {
  created: "0x57a3dc50ed1c4079454e50c49ae6286d274cc8a52976e7207983c4434940b2f9",
  cancelled: "0x2e9842040508f80e6420769a8673529eb3af5b952f53af83d9c9d3432da78046",
  paid: "0x0bc4723e296c91e623d7c3378104610d6df483c9259924aaa2c04527b2df8ede",
};

type Transfer = {
  transaction_hash: string;
  timestamp?: string;
  from?: { hash?: string };
  to?: { hash?: string };
  token?: { address_hash?: string; symbol?: string; decimals?: string };
  total?: { value?: string; decimals?: string };
};
type Log = {
  data?: string;
  topics?: string[];
  decoded?: { parameters?: { name: string; value: string }[] };
};

function units(raw: string | bigint, decimals = 6) {
  let n = 0n;
  try {
    n = BigInt(raw || "0");
  } catch {
    n = 0n;
  }
  const s = n.toString().padStart(decimals + 1, "0");
  const frac = s.slice(-decimals).replace(/0+$/, "");
  return frac ? `${s.slice(0, -decimals)}.${frac}` : s.slice(0, -decimals);
}

function params(log: Log) {
  return Object.fromEntries((log.decoded?.parameters ?? []).map((x) => [x.name, x.value]));
}

function topicId(id: string | bigint) {
  return `0x${BigInt(id).toString(16).padStart(64, "0")}`;
}

function slot(data: string, i: number) {
  return data.slice(2 + i * 64, 2 + (i + 1) * 64);
}

function addressOf(topic?: string) {
  return `0x${(topic ?? "").slice(-40)}`;
}

function symbolOf(env: Env, token: string) {
  return token === env.EURC.toLowerCase() ? "EURC" : "USDC";
}

function invoiceFields(log: Log, usdc: string) {
  const p = params(log);
  if (p.amount) {
    return { token: (p.token || usdc).toLowerCase(), amount: BigInt(p.amount), expiresAt: Number(p.expiresAt ?? 0), memo: p.memo ?? "" };
  }
  const data = log.data ?? "0x";
  if (data.length < 2 + 64 * 3) return { token: usdc.toLowerCase(), amount: 0n, expiresAt: 0, memo: "" };
  return {
    token: `0x${slot(data, 0).slice(24)}`.toLowerCase(),
    amount: BigInt(`0x${slot(data, 1)}`),
    expiresAt: Number(BigInt(`0x${slot(data, 2)}`)),
    memo: "",
  };
}

function paidRef(item: Log, id: string) {
  if (item.topics?.[0]?.toLowerCase() !== TOPICS.paid) return false;
  const d = params(item);
  if (d.refId) return d.refId === id;
  const data = item.data ?? "0x";
  if (data.length < 2 + 64 * 3) return false;
  return BigInt(`0x${slot(data, 2)}`).toString() === id;
}

function invoiceState(logs: Log[], id: string) {
  const padded = topicId(id);
  for (const item of logs) {
    if (item.topics?.[0]?.toLowerCase() === TOPICS.cancelled && item.topics[1]?.toLowerCase() === padded) return "cancelled";
    if (paidRef(item, id)) return "paid";
  }
  return null;
}

function scan<T>(env: Env, path: string) {
  return scanGet<T>(env.ARCSCAN_URL, path);
}

async function contractLogs(env: Env) {
  const page = await scan<{ items?: Log[] }>(env, `/addresses/${env.CONTRACT_ADDRESS}/logs`);
  return page.items ?? [];
}

async function balances(env: Env, wallet: string) {
  const data = `0x70a08231${wallet.slice(2).toLowerCase().padStart(64, "0")}`;
  const res = await fetch(env.RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify([env.USDC, env.EURC].map((to, id) => ({ jsonrpc: "2.0", id, method: "eth_call", params: [{ to, data }, "latest"] }))),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("rpc failed");
  const rows = (await res.json()) as { id: number; result?: string }[];
  const of = (id: number) => units(rows.find((row) => row.id === id)?.result ?? "0x0");
  return { usdc: of(0), eurc: of(1) };
}

export async function loadWalletHome(env: Env, wallet: string) {
  const me = wallet.toLowerCase();
  const feeTo = env.FEE_TO?.toLowerCase();
  const wanted = new Set([env.USDC.toLowerCase(), env.EURC.toLowerCase()]);
  const [bal, transfers, logs] = await Promise.all([
    balances(env, wallet),
    scan<{ items?: Transfer[] }>(env, `/addresses/${wallet}/token-transfers?type=ERC-20`),
    contractLogs(env),
  ]);
  return {
    balances: bal,
    activity: (transfers.items ?? [])
      .filter(
        (row) =>
          wanted.has(row.token?.address_hash?.toLowerCase() ?? "") &&
          (row.to?.hash ?? "").toLowerCase() !== feeTo &&
          (row.from?.hash ?? "").toLowerCase() !== feeTo,
      )
      .slice(0, 20)
      .map((row) => {
        const from = row.from?.hash ?? "";
        const to = row.to?.hash ?? "";
        const dir = from.toLowerCase() === me ? "out" : "in";
        return {
          id: `${row.transaction_hash}-${from}-${to}`,
          hash: row.transaction_hash,
          dir,
          counterparty: dir === "out" ? to : from,
          from,
          to,
          amount: units(row.total?.value ?? "0", Number(row.total?.decimals ?? row.token?.decimals ?? 6)),
          token: row.token?.symbol ?? "USDC",
          ts: Date.parse(row.timestamp ?? "") || 0,
        };
      }),
    invoices: invoicesFor(env, logs, wallet),
  };
}

function invoicesFor(env: Env, logs: Log[], wallet: string) {
  const me = wallet.toLowerCase().slice(2);
  return logs
    .filter((item) => item.topics?.[0]?.toLowerCase() === TOPICS.created && (item.topics[2] ?? "").toLowerCase().endsWith(me))
    .slice(0, 8)
    .map((log) => {
      const id = BigInt(log.topics?.[1] ?? "0").toString();
      const fields = invoiceFields(log, env.USDC);
      const state = invoiceState(logs, id);
      const expired = fields.expiresAt > 0 && Date.now() / 1000 > fields.expiresAt;
      return {
        id,
        amount: units(fields.amount, 6),
        token: symbolOf(env, fields.token),
        status: state === "paid" ? "Completed" : state === "cancelled" ? "Cancelled" : expired ? "Expired" : "Pending",
        expiresAt: fields.expiresAt,
        counterparty: addressOf(log.topics?.[3]),
      };
    });
}

export async function loadInvoice(env: Env, id: string) {
  const logs = await contractLogs(env);
  const padded = topicId(id);
  const created = logs.find((item) => item.topics?.[0]?.toLowerCase() === TOPICS.created && item.topics[1]?.toLowerCase() === padded);
  if (!created) return null;
  const fields = invoiceFields(created, env.USDC);
  const symbol = symbolOf(env, fields.token);
  return {
    payee: addressOf(created.topics?.[2]),
    payer: addressOf(created.topics?.[3]),
    token: symbol,
    tokenAddress: symbol === "EURC" ? env.EURC : env.USDC,
    amount: units(fields.amount, 6),
    rawAmount: fields.amount.toString(),
    expiresAt: fields.expiresAt,
    memo: fields.memo,
    closed: invoiceState(logs, id) !== null,
  };
}

export async function invoiceIdFromTx(env: Env, hash: string) {
  const page = await scan<{ items?: Log[] }>(env, `/transactions/${hash}/logs`);
  const log = (page.items ?? []).find((item) => item.topics?.[0]?.toLowerCase() === TOPICS.created);
  if (!log?.topics?.[1]) return null;
  return BigInt(log.topics[1]).toString();
}
