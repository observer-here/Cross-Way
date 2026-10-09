import { erc20Abi, parseAbiItem, type Address, zeroAddress } from "viem";

import { fromTokenAmount } from "@/lib/format";

import { crossWayAbi } from "./abi";
import { ARC, TOKENS } from "./arc";
import { publicClient } from "./public";

export async function loadBalances(wallet: Address) {
  const [gas, usdc, eurc] = await Promise.all([
    publicClient.getBalance({ address: wallet }),
    publicClient.readContract({ address: TOKENS.USDC.address, abi: erc20Abi, functionName: "balanceOf", args: [wallet] }),
    publicClient.readContract({ address: TOKENS.EURC.address, abi: erc20Abi, functionName: "balanceOf", args: [wallet] }),
  ]);
  return {
    gas: fromTokenAmount(gas, 18),
    usdc: fromTokenAmount(usdc, 6),
    eurc: fromTokenAmount(eurc, 6),
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

const methods = ["Sent", "Request", "Link", "Claim"];

const paidEvent = parseAbiItem(
  "event Paid(address indexed from, address indexed to, address indexed token, uint256 amount, bytes32 key, uint8 method, uint256 refId, bytes memo)",
);

export async function loadActivity(wallet: Address): Promise<ActivityItem[]> {
  const [sent, recv] = await Promise.all([
    publicClient.getLogs({ address: ARC.contract, event: paidEvent, args: { from: wallet }, fromBlock: 0n }),
    publicClient.getLogs({ address: ARC.contract, event: paidEvent, args: { to: wallet }, fromBlock: 0n }),
  ]);
  const logs = [...sent, ...recv].sort((a, b) => Number(b.blockNumber - a.blockNumber)).slice(0, 20);
  const blocks = await Promise.all(
    [...new Set(logs.map((l) => l.blockNumber))].map(async (n) => {
      const b = await publicClient.getBlock({ blockNumber: n });
      return [n.toString(), Number(b.timestamp) * 1000] as const;
    }),
  );
  const times = Object.fromEntries(blocks);
  return logs.map((log) => {
    const token = log.args.token === TOKENS.EURC.address ? "EURC" : "USDC";
    const method = Number(log.args.method ?? 0);
    const dir = log.args.from?.toLowerCase() === wallet.toLowerCase() ? "out" : "in";
    return {
      id: `${log.transactionHash}-${log.logIndex}`,
      dir,
      kind: methods[method] ?? "Paid",
      counterparty: (dir === "out" ? log.args.to : log.args.from) ?? "",
      amount: fromTokenAmount(log.args.amount ?? 0n, 6),
      token,
      time: new Date(times[log.blockNumber.toString()] ?? Date.now()).toLocaleString(),
      method,
    };
  });
}

export async function loadInvoice(id: bigint) {
  const row = await publicClient.readContract({ address: ARC.contract, abi: crossWayAbi, functionName: "invoices", args: [id] });
  if (row[0] === zeroAddress) return null;
  return {
    payee: row[0],
    payer: row[1],
    token: row[3] === TOKENS.EURC.address ? "EURC" : "USDC",
    tokenAddress: row[3],
    amount: fromTokenAmount(row[4], 6),
    rawAmount: row[4],
    expiresAt: Number(row[5]),
    closed: row[7],
  };
}
