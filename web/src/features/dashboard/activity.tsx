import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { zeroAddress } from "viem";

import { useSession } from "@/auth/session";
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
  const pendingShown = all ? pending : pending.slice(0, 1);
  const shown = rows ? (all ? rows : rows.slice(0, Math.max(0, 4 - pendingShown.length))) : [];

  return (
    <section className="dash-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {!all && (
          <Link to="/history" className="text-sm font-medium text-indigo-500">
            View All →
          </Link>
        )}
      </div>
      {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !rows && !err && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
      {rows && shown.length === 0 && pendingShown.length === 0 && <p className="mt-6 text-sm text-slate-400">No payments yet.</p>}
      {(shown.length > 0 || pendingShown.length > 0) && (
        <ul className="mt-2">
          {shown.map((tx) => (
            <Row
              key={tx.id}
              to={`/tx/${tx.hash}`}
              kind={kindOf(tx)}
              title={label(tx)}
              time={tx.time}
              amount={`${tx.dir === "out" ? "-" : "+"}${money(tx.amount)} ${tx.token}`}
              tone={tx.dir === "out" ? "text-slate-500" : "text-emerald-500"}
              done
            />
          ))}
          {pendingShown.map((row) => (
            <Row key={`inv-${row.id}`} to={`/pay/${row.id}`} kind="request" title={askLabel(row)} time={row.time} amount={`${money(row.amount)} ${row.token}`} tone="text-slate-700" />
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ to, kind, title, time, amount, tone, done }: { to: string; kind: Kind; title: string; time: string; amount: string; tone: string; done?: boolean }) {
  return (
    <li>
      <Link to={to} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
        <KindIcon kind={kind} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-slate-800">{title}</span>
          <span className="block text-xs whitespace-nowrap text-slate-400">{time}</span>
        </span>
        <span className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
          <span className={`text-sm whitespace-nowrap tabular-nums ${tone}`}>{amount}</span>
          <Status ok={done} />
        </span>
      </Link>
    </li>
  );
}

function money(amount: string) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function kindOf(tx: ActivityItem) {
  return tx.dir === "out" ? ("send" as const) : ("receive" as const);
}

function label(tx: ActivityItem) {
  const who = personLabel(tx.counterparty);
  return tx.dir === "out" ? `Sent to ${who}` : `Received from ${who}`;
}

function askLabel(row: InvoiceRow) {
  if (!row.counterparty || row.counterparty.toLowerCase() === zeroAddress) return "Payment request";
  return `Request to ${personLabel(row.counterparty)}`;
}

function Status({ ok }: { ok?: boolean }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${ok ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-400"}`}>{ok ? "Completed" : "Pending"}</span>;
}

type Kind = "send" | "receive" | "request";

function KindIcon({ kind }: { kind: Kind }) {
  const tone = kind === "send" ? "bg-indigo-50 text-indigo-500" : kind === "receive" ? "bg-emerald-50 text-emerald-500" : "bg-fuchsia-50 text-fuchsia-500";
  const d =
    kind === "send"
      ? "M3.2 11.4 20.6 3.4l-7.2 17.2-2.5-6.8L3.2 11.4z"
      : kind === "request"
        ? "M8 3.5v2M16 3.5v2M5.5 9h13M7 5.2h10a1.8 1.8 0 0 1 1.8 1.8V19a1.4 1.4 0 0 1-1.4 1.4H6.6A1.4 1.4 0 0 1 5.2 19V7a1.8 1.8 0 0 1 1.8-1.8z"
        : "M12 4v11m0 0 4-4m-4 4-4-4M6 20h12";
  const stroke = kind !== "send";
  return (
    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone}`}>
      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    </span>
  );
}
