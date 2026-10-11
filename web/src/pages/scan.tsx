import { useState } from "react";

import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { shortAddress } from "@/lib/format";
import { qrSrc, SideMark, SoftIcon } from "@/shared/ui/mark";

export function ScanPage() {
  const { wallet } = useSession();
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");

  if (!wallet) return <p className="page text-sm text-slate-500">Waiting for wallet…</p>;

  async function copy() {
    await navigator.clipboard.writeText(wallet!);
  }

  return (
    <div className="page grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
      <SideMark text="Receive payments. Share your QR code.">
        <SoftIcon className="bg-violet-50 text-violet-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4z" />
          </svg>
        </SoftIcon>
      </SideMark>
      <section className="flex flex-col items-center">
        <h1 className="self-start text-xl font-semibold lg:text-2xl">Your QR Code</h1>
        <div className="panel mt-3 flex w-full max-w-md flex-col items-center p-5 lg:mt-6 lg:p-8">
          <div className="flex rounded-full bg-slate-100 p-1 text-sm">
            {(["USDC", "EURC"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setToken(item)}
                className={`rounded-full px-4 py-1.5 ${token === item ? "bg-white shadow-sm" : "text-slate-400"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <img src={qrSrc(wallet, 280)} alt="Receive QR" className="mt-6 h-52 w-52 rounded-xl bg-white p-2" />
          <button type="button" onClick={copy} className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white">
            Copy Address
          </button>
          <p className="mt-3 font-mono text-xs text-slate-400">{shortAddress(wallet)}</p>
        </div>
      </section>
      <aside className="panel p-4 text-sm lg:p-6">
        <p className="font-semibold">Receive to</p>
        <p className="mt-3 text-slate-500">USDC / EURC</p>
        <p className="mt-6 font-semibold">Network</p>
        <p className="mt-2 text-slate-500">Arc Testnet</p>
        <a href={`${ARC.explorer}/address/${wallet}`} className="mt-6 block text-xs text-indigo-500" target="_blank" rel="noreferrer">
          {shortAddress(wallet)}
        </a>
        <p className="mt-6 text-xs leading-5 text-slate-400">Anyone can scan this QR or use your address to send you tokens.</p>
      </aside>
    </div>
  );
}
