import { useState } from "react";
import { Link } from "react-router-dom";

import { useBalances } from "@/chain/balances";

export function Balance() {
  const { wallet, data, err } = useBalances();
  const [sym, setSym] = useState<"USDC" | "EURC">("USDC");
  const value = sym === "EURC" ? data?.eurc : data?.usdc;

  return (
    <section className="panel p-6">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Your Balance</span>
        <select value={sym} onChange={(e) => setSym(e.target.value as "USDC" | "EURC")} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 outline-none">
          <option value="USDC">USDC</option>
          <option value="EURC">EURC</option>
        </select>
      </div>
      {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !data && !err && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
      {data && (
        <>
          <div className="mt-3 flex items-end gap-4">
            <p className="text-5xl font-semibold tracking-tight">${value}</p>
            <svg viewBox="0 0 220 72" className="mb-1 h-16 min-w-0 flex-1 text-violet-400" preserveAspectRatio="none" aria-hidden>
              <path d="M0 52 Q36 50 64 30 T128 34 T220 8" fill="none" stroke="currentColor" strokeWidth="2.6" />
              <path d="M0 72 Q36 50 64 30 T128 34 T220 8 V72 Z" fill="currentColor" opacity="0.14" />
            </svg>
          </div>
          <div className="mt-7 flex gap-2">
            <Link to="/scan" className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-500">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M12 4v12m0 0 4-4m-4 4-4-4M5 19h14" />
                </svg>
              </span>
              Deposit
            </Link>
            <Link to="/send" className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-slate-500">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
                  <path d="M8 8h7a3 3 0 0 1 3 3M16 16H9a3 3 0 0 1-3-3" />
                  <path d="m15 5 3 3-3 3M9 19l-3-3 3-3" />
                </svg>
              </span>
              Swap
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
