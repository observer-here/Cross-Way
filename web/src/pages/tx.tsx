import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { loadTx, type ActivityItem } from "@/chain/read";
import { personLabel, shortAddress } from "@/lib/format";

export function TxPage() {
  const { hash } = useParams();
  const { wallet } = useSession();
  const [tx, setTx] = useState<ActivityItem | null | undefined>(undefined);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet || !hash) return;
    loadTx(hash, wallet)
      .then(setTx)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet, hash]);

  if (!hash) return <p className="page text-sm text-slate-500">Missing transaction.</p>;
  if (tx === undefined && !err) return <p className="page text-sm text-slate-500">Loading…</p>;
  if (!tx) return <p className="page text-sm text-slate-500">{err || "Transaction not found."}</p>;

  return (
    <section className="page">
      <Link to="/history" className="text-sm text-slate-400">
        ← History
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Transaction Details</h1>
      <div className="panel mt-6 p-6">
        <p className={`text-3xl font-semibold ${tx.dir === "out" ? "text-slate-800" : "text-emerald-500"}`}>
          {tx.dir === "out" ? "-" : "+"}
          {tx.amount} {tx.token}
        </p>
        <p className="mt-1 text-sm text-slate-400">{tx.dir === "out" ? `Sent to ${personLabel(tx.counterparty)}` : `Received from ${personLabel(tx.counterparty)}`}</p>
        <dl className="mt-8 space-y-4 text-sm">
          <Row label="Status" value="Completed" />
          <Row label="Date" value={tx.time} />
          <Row label="From" value={shortAddress(tx.from)} />
          <Row label="To" value={shortAddress(tx.to)} />
          <Row label="Network" value="Arc Testnet" />
          <Row label="Token" value={tx.token} />
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Transaction Hash</dt>
            <dd>
              <a href={`${ARC.explorer}/tx/${tx.hash}`} className="text-indigo-500" target="_blank" rel="noreferrer">
                {shortAddress(tx.hash)}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
