import { useEffect, useState } from "react";

import { useSession } from "@/auth/session";
import { loadBalances } from "@/chain/read";
import { ARC } from "@/chain/arc";

export function Balance() {
  const { wallet } = useSession();
  const [data, setData] = useState<{ gas: string; usdc: string; eurc: string } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadBalances(wallet)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet]);

  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Your Balance</span>
        <span>USDC</span>
      </div>
      {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
      {wallet && !data && !err && <p className="mt-6 text-sm text-slate-400">Loading…</p>}
      {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
      {data && (
        <>
          <p className="mt-3 text-4xl font-semibold tracking-tight">{data.usdc} USDC</p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-slate-500">EURC</span>
              <span>{data.eurc}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-slate-500">Gas</span>
              <span>{data.gas} USDC</span>
            </li>
          </ul>
          <a
            href={`${ARC.explorer}/address/${wallet}`}
            className="mt-5 block text-center text-xs text-indigo-500"
            target="_blank"
            rel="noreferrer"
          >
            View on explorer
          </a>
        </>
      )}
    </section>
  );
}
