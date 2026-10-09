import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/auth/session";
import { loadActivity, type ActivityItem } from "@/chain/read";
import { shortAddress } from "@/lib/format";

export function Activity() {
  const { wallet } = useSession();
  const [rows, setRows] = useState<ActivityItem[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadActivity(wallet)
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet]);

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
        <Link to="/history" className="text-xs text-slate-400">
          View All →
        </Link>
      </div>
      {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !rows && !err && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
      {rows && rows.length === 0 && <p className="mt-6 text-sm text-slate-400">No payments yet.</p>}
      {rows && rows.length > 0 && (
        <ul className="mt-4 space-y-4">
          {rows.map((tx) => (
            <li key={tx.id} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate">
                  {tx.kind} {shortAddress(tx.counterparty)}
                </span>
                <span className="text-xs text-slate-400">{tx.time}</span>
              </span>
              <span className={tx.dir === "out" ? "text-slate-700" : "text-emerald-500"}>
                {tx.dir === "out" ? "-" : "+"}
                {tx.amount} {tx.token}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
