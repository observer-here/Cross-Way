import { decodeAbiParameters, type Address, zeroAddress } from "viem";

import { fromTokenAmount } from "@/lib/format";

import { ARC, TOKENS } from "./arc";
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

const INVOICE_TOPIC = "0x013652cd6514bf2341791dd49f5b3c74d08951a91adc6b4d3a6b9d2567abe92a";

export async function loadInvoice(id: bigint) {
  const page = await scanGet<{ items?: ScanLog[] }>(`/addresses/${ARC.contract}/logs`);
  const padded = `0x${id.toString(16).padStart(64, "0")}`;
  const log = (page.items ?? []).find((item) => {
    const topics = item.topics ?? [];
    return topics[0]?.toLowerCase() === INVOICE_TOPIC && topics[1]?.toLowerCase() === padded;
  });
  if (!log) return null;
  const topics = log.topics ?? [];
  const payee = (`0x${(topics[2] ?? "").slice(-40)}` as Address) || zeroAddress;
  const payer = (`0x${(topics[3] ?? "").slice(-40)}` as Address) || zeroAddress;
  let tokenAddr = TOKENS.USDC.address as Address;
  let amount = 0n;
  let expiresAt = 0;
  if (log.decoded?.parameters) {
    const p = Object.fromEntries(log.decoded.parameters.map((x) => [x.name, x.value]));
    tokenAddr = ((p.token as Address) || tokenAddr) as Address;
    amount = BigInt(p.amount ?? "0");
    expiresAt = Number(p.expiresAt ?? 0);
  } else if (log.data && log.data !== "0x") {
    const decoded = decodeAbiParameters(
      [
        { type: "bytes32" },
        { type: "address" },
        { type: "uint256" },
        { type: "uint64" },
        { type: "uint8" },
        { type: "bytes" },
      ],
      log.data as `0x${string}`,
    );
    tokenAddr = decoded[1];
    amount = decoded[2];
    expiresAt = Number(decoded[3]);
  }
  if (payee === zeroAddress) return null;
  const token = tokenAddr.toLowerCase() === TOKENS.EURC.address.toLowerCase() ? "EURC" : "USDC";
  return {
    payee,
    payer,
    token,
    tokenAddress: tokenAddr,
    amount: fromTokenAmount(amount, 6),
    rawAmount: amount,
    expiresAt,
    closed: false,
  };
}
