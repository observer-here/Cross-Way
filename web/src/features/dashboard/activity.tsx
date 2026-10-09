import { Link } from "react-router-dom";

import { txs } from "./data";

const icons: Record<string, { bg: string; mark: string }> = {
  out: { bg: "bg-sky-50 text-sky-500", mark: "➤" },
  in: { bg: "bg-emerald-50 text-emerald-500", mark: "↓" },
  req: { bg: "bg-fuchsia-50 text-fuchsia-500", mark: "▦" },
};

export function Activity() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
        <Link to="/history" className="text-xs text-slate-400">
          View All →
        </Link>
      </div>
      <ul className="mt-4 space-y-4">
        {txs.map((tx) => {
          const icon = icons[tx.dir] ?? icons.in;
          return (
            <li key={tx.time + tx.kind} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${icon.bg}`}>{icon.mark}</span>
                <span className="truncate">
                  <span className="block truncate">
                    {tx.kind} {tx.name}
                  </span>
                  <span className="text-xs text-slate-400">{tx.time}</span>
                </span>
              </span>
              <span className={tx.dir === "out" ? "text-slate-700" : tx.dir === "req" ? "text-slate-700" : "text-emerald-500"}>
                {tx.amount} {tx.token}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${tx.status === "Pending" ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"}`}>
                {tx.status}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
