import type { Env } from "../../env";

import { scanGet } from "./scan";

const ZERO = "0x0000000000000000000000000000000000000000";
const TOPICS = {
  created: "0x57a3dc50ed1c4079454e50c49ae6286d274cc8a52976e7207983c4434940b2f9",
  cancelled: "0x2e9842040508f80e6420769a8673529eb3af5b952f53af83d9c9d3432da78046",
  paid: "0x0bc4723e296c91e623d7c3378104610d6df483c9259924aaa2c04527b2df8ede",
};

type TokenBal = { value?: string; token?: { address_hash?: string; decimals?: string } };
type Transfer = {
  transaction_hash: string;
  timestamp?: string;
  method?: string | null;
  from?: { hash?: string };
  to?: { hash?: string };
  token?: { address_hash?: string; symbol?: string; decimals?: string };
  total?: { value?: string; decimals?: string };
};
type Log = {
  transaction_hash?: string;
  timestamp?: string;
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

function shortTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
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

function scan<T>(env: Env, path: string) {
  return scanGet<T>(env.ARCSCAN_URL, path);
}

async function contractLogs(env: Env) {
  const page = await scan<{ items?: Log[] }>(env, `/addresses/${env.CONTRACT_ADDRESS}/logs`);
  return page.items ?? [];
}

export async function loadWalletHome(env: Env, wallet: string) {
  const me = wallet.toLowerCase();
  const wanted = new Set([env.USDC.toLowerCase(), env.EURC.toLowerCase()]);
  const [acct, tokens, transfers, logs] = await Promise.all([
    scan<{ coin_balance?: string }>(env, `/addresses/${wallet}`),
    scan<TokenBal[]>(env, `/addresses/${wallet}/token-balances`),
    scan<{ items?: Transfer[] }>(env, `/addresses/${wallet}/token-transfers?type=ERC-20`),
    contractLogs(env),
  ]);
  const list = Array.isArray(tokens) ? tokens : [];
  const pick = (addr: string) => list.find((t) => t.token?.address_hash?.toLowerCase() === addr.toLowerCase());
  const usdc = pick(env.USDC);
  const eurc = pick(env.EURC);
  const data = {
    balances: {
      gas: units(acct.coin_balance ?? "0", 18),
      usdc: units(usdc?.value ?? "0", Number(usdc?.token?.decimals ?? 6)),
      eurc: units(eurc?.value ?? "0", Number(eurc?.token?.decimals ?? 6)),
    },
    activity: (transfers.items ?? [])
      .filter((row) => {
        if (!wanted.has(row.token?.address_hash?.toLowerCase() ?? "")) return false;
        const feeTo = env.FEE_TO?.toLowerCase();
        if (!feeTo) return true;
        return (row.to?.hash ?? "").toLowerCase() !== feeTo && (row.from?.hash ?? "").toLowerCase() !== feeTo;
      })
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
          amount: units(row.total?.value ?? "0", decimals),
          token: row.token?.symbol ?? "USDC",
          time: shortTime(row.timestamp),
          ts: Date.parse(row.timestamp ?? "") || 0,
        };
      }),
    invoices: invoicesFor(env, logs, wallet),
  };
  return data;
}

function invoicesFor(env: Env, logs: Log[], wallet: string) {
  const me = wallet.toLowerCase().slice(2);
  return logs
    .filter((item) => {
      const t = item.topics ?? [];
      return t[0]?.toLowerCase() === TOPICS.created && (t[2] ?? "").toLowerCase().endsWith(me);
    })
    .slice(0, 8)
    .map((log) => {
      const id = BigInt(log.topics?.[1] ?? "0").toString();
      const padded = topicId(id);
      const payer = `0x${(log.topics?.[3] ?? "").slice(-40)}`;
      const fields = invoiceFields(log, env.USDC);
      const paid = logs.some((item) => paidRef(item, id));
      const cancelled = logs.some((item) => item.topics?.[0]?.toLowerCase() === TOPICS.cancelled && item.topics?.[1]?.toLowerCase() === padded);
      const expired = fields.expiresAt > 0 && Date.now() / 1000 > fields.expiresAt;
      return {
        id,
        amount: units(fields.amount, 6),
        token: fields.token === env.EURC.toLowerCase() ? "EURC" : "USDC",
        status: paid || cancelled ? "Completed" : expired ? "Expired" : "Pending",
        time: log.timestamp ? shortTime(log.timestamp) : fields.expiresAt ? `Due ${shortTime(new Date(fields.expiresAt * 1000).toISOString())}` : "",
        counterparty: payer,
      };
    });
}

function paidRef(item: Log, id: string) {
  if (item.topics?.[0]?.toLowerCase() !== TOPICS.paid) return false;
  const d = params(item);
  if (d.refId) return d.refId === id;
  const data = item.data ?? "0x";
  if (data.length < 2 + 64 * 3) return false;
  return BigInt(`0x${slot(data, 2)}`).toString() === id;
}

export async function loadInvoice(env: Env, id: string) {
  const logs = await contractLogs(env);
  const padded = topicId(id);
  const created = logs.find((item) => {
    const t = item.topics ?? [];
    return t[0]?.toLowerCase() === TOPICS.created && t[1]?.toLowerCase() === padded;
  });
  if (!created) return null;
  const topics = created.topics ?? [];
  const payee = `0x${(topics[2] ?? "").slice(-40)}`;
  const payer = `0x${(topics[3] ?? "").slice(-40)}`;
  if (payee === ZERO) return null;
  const fields = invoiceFields(created, env.USDC);
  const cancelled = logs.some((item) => item.topics?.[0]?.toLowerCase() === TOPICS.cancelled && item.topics?.[1]?.toLowerCase() === padded);
  const paid = logs.some((item) => {
    if (!paidRef(item, id)) return false;
    const d = params(item);
    if (d.method) return d.method === "1" || d.method === "2";
    const data = item.data ?? "0x";
    if (data.length < 2 + 64 * 2) return true;
    const method = Number(BigInt(`0x${slot(data, 1)}`));
    return method === 1 || method === 2;
  });
  return {
    payee,
    payer,
    token: fields.token === env.EURC.toLowerCase() ? "EURC" : "USDC",
    tokenAddress: fields.token === env.EURC.toLowerCase() ? env.EURC : env.USDC,
    amount: units(fields.amount, 6),
    rawAmount: fields.amount.toString(),
    expiresAt: fields.expiresAt,
    memo: fields.memo,
    closed: cancelled || paid,
  };
}

export async function invoiceIdFromTx(env: Env, hash: string) {
  const page = await scan<{ items?: Log[] }>(env, `/transactions/${hash}/logs`);
  const log = (page.items ?? []).find((item) => item.topics?.[0]?.toLowerCase() === TOPICS.created);
  if (!log?.topics?.[1]) return null;
  return BigInt(log.topics[1]).toString();
}
