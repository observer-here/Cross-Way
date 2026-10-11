import { isAddress, zeroAddress } from "viem";
import { useEffect, useState, type FormEvent } from "react";

import { useSession } from "@/auth/session";
import { loadMyInvoices, waitInvoiceId, type InvoiceRow } from "@/chain/read";
import { useArcWallet } from "@/chain/wallet";
import { createPaymentRequest } from "@/chain/write";
import { personLabel, shortTime } from "@/lib/format";
import { DaysSelect, Field, Glow, Input, Textarea, TokenSelect } from "@/shared/ui/field";
import { SideMark, SoftIcon } from "@/shared/ui/mark";

export function RequestPage() {
  const { wallet } = useSession();
  const signer = useArcWallet();
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDC");
  const [memo, setMemo] = useState("");
  const [days, setDays] = useState("7");
  const [status, setStatus] = useState("");
  const [rows, setRows] = useState<InvoiceRow[] | null>(null);

  useEffect(() => {
    if (!wallet) return;
    loadMyInvoices(wallet)
      .then(setRows)
      .catch(() => setRows([]));
  }, [wallet]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Creating…");
    try {
      const hash = await createPaymentRequest(signer, from, amount, token, memo, Number(days));
      setStatus("Indexing…");
      const id = await waitInvoiceId(hash);
      setStatus(id ? `Pay link: ${window.location.origin}/pay/${id}` : `Created. Tx ${hash.slice(0, 10)}…`);
      if (wallet) setRows(await loadMyInvoices(wallet, true).catch(() => rows));
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <div className="page grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      <SideMark text="Request tokens from anyone. Easily.">
        <SoftIcon className="bg-fuchsia-50 text-fuchsia-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <rect x="5" y="4" width="14" height="16" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h4" className="stroke-white" strokeWidth="1.5" fill="none" />
          </svg>
        </SoftIcon>
      </SideMark>
      <section>
        <h1 className="text-xl font-semibold lg:text-2xl">Request Payment</h1>
        <p className="mt-1 text-sm text-slate-500">Create a request and let anyone pay you.</p>
        <div className="mt-3 grid items-start gap-3 lg:mt-6 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="panel flex flex-col gap-3 p-4 lg:gap-5 lg:p-8" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" required />
            </Field>
            <Field label="Token">
              <TokenSelect value={token} onChange={(e) => setToken(e.target.value)} />
            </Field>
          </div>
          <Field label="Request From">
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="username, email, EVM address or user ID" />
          </Field>
          {from && <p className="text-xs text-slate-400">{isAddress(from) ? from : personLabel(from)}</p>}
          <Field label="Message (optional)">
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={200} placeholder="For rent, coffee, project..." />
          </Field>
          <Field label="Expiry (optional)">
            <DaysSelect value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
          <Glow disabled={!signer.address}>{signer.address ? "Create Request →" : "Wallet loading…"}</Glow>
          {status && <p className="text-sm text-slate-500">{status}</p>}
        </form>
      <aside className="panel p-3.5 lg:p-5">
        <h2 className="text-sm font-semibold">Recent Requests</h2>
        {!rows && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
        {rows && rows.length === 0 && <p className="mt-6 text-sm text-slate-400">No requests yet.</p>}
        {rows && rows.length > 0 && (
          <ul className="mt-3">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {row.amount} {row.token}
                  </span>
                  <span className="block truncate text-[11px] text-slate-400">
                    from {row.counterparty && row.counterparty.toLowerCase() !== zeroAddress ? personLabel(row.counterparty) : "anyone"}
                  </span>
                  <span className="text-[11px] text-slate-400">Due {shortTime(row.expiresAt * 1000)}</span>
                </span>
                <Status status={row.status} />
              </li>
            ))}
          </ul>
        )}
      </aside>
        </div>
      </section>
    </div>
  );
}

function Status({ status }: { status: InvoiceRow["status"] }) {
  const tone = status === "Pending" ? "text-orange-400" : status === "Completed" ? "text-emerald-500" : "text-rose-400";
  return <span className={`text-[11px] ${tone}`}>{status}</span>;
}
