import { useState } from "react";
import { Link } from "react-router-dom";

import { txs } from "./data";

const tabs = ["All", "Sent", "Received", "Requests", "Links"];

export function Transactions() {
  const [tab, setTab] = useState("All");
  const rows = txs.filter((tx) => {
    if (tab === "Sent") return tx.dir === "out";
    if (tab === "Received") return tx.dir === "in" && tx.kind.startsWith("Received");
    if (tab === "Requests") return tx.dir === "req";
    if (tab === "Links") return tx.kind.startsWith("Link");
    return true;
  });

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Transactions</h2>
        <Link to="/history" className="text-xs text-white/40">
          View All →
        </Link>
      </div>
      <div className="mt-3 flex gap-1 text-xs">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 ${tab === t ? "bg-white/10 text-white" : "text-white/40"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <ul className="mt-4 space-y-3">
        {rows.map((tx) => (
          <li key={tx.time + tx.name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-500/80 text-xs font-semibold">
                {tx.name[0].toUpperCase()}
              </span>
              <span className="truncate">
                <span className="block truncate">
                  {tx.kind} {tx.name}
                </span>
                <span className="text-xs text-white/35">
                  {tx.hash} · {tx.time}
                </span>
              </span>
            </span>
            <span className="text-right">
              <span className={`block ${tx.dir === "out" ? "text-rose-400" : tx.dir === "req" ? "text-white" : "text-emerald-400"}`}>
                {tx.amount}
              </span>
              <span className="text-[10px] text-white/35">{tx.token}</span>
            </span>
            <span className={`text-xs ${tx.status === "Pending" ? "text-amber-300" : "text-emerald-400"}`}>{tx.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
