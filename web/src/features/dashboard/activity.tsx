import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { zeroAddress } from "viem";

import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { loadActivity, loadMyInvoices, type ActivityItem, type InvoiceRow } from "@/chain/read";
import { personLabel } from "@/lib/format";

export function Activity({ title = "Recent Activity", all = false }: { title?: string; all?: boolean }) {
  const { wallet } = useSession();
  const [rows, setRows] = useState<ActivityItem[] | null>(null);
  const [asks, setAsks] = useState<InvoiceRow[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadActivity(wallet)
      .then(setRows)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
    loadMyInvoices(wallet)
      .then(setAsks)
      .catch(() => setAsks([]));
  }, [wallet]);

  const pending = asks.filter((r) => r.status === "Pending");
  const shown = rows ? (all ? rows : rows.slice(0, pending.length ? 3 : 4)) : [];

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {!all && (
          <Link to="/history" className="text-xs text-slate-400">
            View All →
          </Link>
        )}
      </div>
      {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !rows && !err && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
      {rows && shown.length === 0 && pending.length === 0 && <p className="mt-6 text-sm text-slate-400">No payments yet.</p>}
      {(shown.length > 0 || pending.length > 0) && (
        <ul className="mt-3">
          {shown.map((tx) => (
            <li key={tx.id}>
              <Link to={`/tx/${tx.hash}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5">
                <KindIcon kind={kindOf(tx)} />
                <span className="min-w-0">
                  <span className="block truncate text-sm">{label(tx)}</span>
                  <span className="text-xs text-slate-400">{tx.time}</span>
                </span>
                <span className="text-right">
                  <span className={`block text-sm ${tx.dir === "out" ? "text-slate-600" : "text-emerald-500"}`}>
                    {tx.dir === "out" ? "-" : "+"}${tx.amount} {tx.token}
                  </span>
                  <span className="text-[11px] text-emerald-500">Completed</span>
                </span>
              </Link>
            </li>
          ))}
          {!all &&
            pending.slice(0, 2).map((row) => (
              <li key={`inv-${row.id}`}>
                <Link to={`/pay/${row.id}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5">
                  <KindIcon kind="request" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm">{askLabel(row)}</span>
                    <span className="text-xs text-slate-400">{row.time}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm text-slate-700">
                      {row.amount} {row.token}
                    </span>
                    <span className="text-[11px] text-orange-400">Pending</span>
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

function kindOf(tx: ActivityItem) {
  const contract = tx.to.toLowerCase() === ARC.contract.toLowerCase() || tx.from.toLowerCase() === ARC.contract.toLowerCase();
  if (contract) return "link" as const;
  return tx.dir === "out" ? ("send" as const) : ("receive" as const);
}

function label(tx: ActivityItem) {
  const who = personLabel(tx.counterparty);
  if (kindOf(tx) === "link") return "Payment link";
  return tx.dir === "out" ? `Sent to ${who}` : `Received from ${who}`;
}

function askLabel(row: InvoiceRow) {
  if (!row.counterparty || row.counterparty.toLowerCase() === zeroAddress) return "Payment request";
  return `Request to ${personLabel(row.counterparty)}`;
}

function KindIcon({ kind }: { kind: "send" | "receive" | "link" | "request" }) {
  const tone =
    kind === "link" ? "bg-emerald-50 text-emerald-500" : kind === "send" ? "bg-sky-50 text-sky-500" : kind === "request" ? "bg-fuchsia-50 text-fuchsia-500" : "bg-violet-50 text-violet-500";
  const d =
    kind === "link"
      ? "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"
      : kind === "send"
        ? "M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z"
        : kind === "request"
          ? "M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z"
          : "M12 3v12m0 0 4-4m-4 4-4-4M5 19h14";
  const stroke = kind === "receive" || kind === "link";
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${tone}`}>
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth="1.8">
        <path d={d} />
      </svg>
    </span>
  );
}
