import { useState } from "react";
import { Link } from "react-router-dom";

import { useBalances } from "@/chain/balances";

export function Balance() {
  const { wallet, data, err } = useBalances();
  const [sym, setSym] = useState<"USDC" | "EURC">("USDC");
  const [open, setOpen] = useState(true);
  const raw = sym === "EURC" ? data?.eurc : data?.usdc;
  const amount = raw == null ? "" : Number(raw).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className="dash-card flex flex-col p-6">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          Your Balance
          <button type="button" onClick={() => setOpen((v) => !v)} className="text-slate-400" aria-label={open ? "Hide balance" : "Show balance"}>
            <Eye off={!open} />
          </button>
        </span>
        <select value={sym} onChange={(e) => setSym(e.target.value as "USDC" | "EURC")} className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 outline-none">
          <option value="USDC">USDC</option>
          <option value="EURC">EURC</option>
        </select>
      </div>
      {!wallet && <p className="mt-8 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !data && !err && <p className="mt-8 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-8 text-sm text-rose-500">{err}</p>}
      {data && (
        <>
          <div className="relative mt-4 min-h-[132px]">
            <p className="relative z-10 text-5xl font-bold tracking-tight text-slate-950">{open ? `$${amount}` : "••••"}</p>
            <svg viewBox="0 0 260 120" className="absolute right-0 bottom-0 h-28 w-[62%] text-violet-400" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="currentColor" stopOpacity="0.38" />
                  <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 86 C28 84 48 78 72 64 C102 46 112 72 148 58 C176 48 196 36 228 18 C244 10 252 16 260 6 V120 H0 Z" fill="url(#balance-fill)" />
              <path d="M0 86 C28 84 48 78 72 64 C102 46 112 72 148 58 C176 48 196 36 228 18 C244 10 252 16 260 6" fill="none" stroke="currentColor" strokeWidth="2.4" />
            </svg>
          </div>
          <div className="mt-5 flex gap-3">
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 20h14" />
              </svg>
              Deposit
            </Link>
            <Link to="/send" className="inline-flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <path d="M7 7h8a3 3 0 0 1 3 3M17 17H9a3 3 0 0 1-3-3" />
                <path d="m16 4 3 3-3 3M8 20l-3-3 3-3" />
              </svg>
              Swap
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function Eye({ off }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden>
      <path d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.6" />
      {off && <path d="M4 5 20 19" />}
    </svg>
  );
}
