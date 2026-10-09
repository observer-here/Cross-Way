export function Balance() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">Your Balance</span>
        <span className="rounded-full bg-slate-50 px-2 py-1">USDC ▾</span>
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight">$152.60</p>
      <p className="mt-1 text-xs text-emerald-500">▲ +12.4% (24h)</p>
      <svg viewBox="0 0 320 88" className="mt-4 h-20 w-full">
        <path d="M0 70 C40 68 55 40 90 48 C120 56 140 22 180 28 C220 34 240 50 280 24 C300 12 312 18 320 10 V88 H0 Z" fill="url(#bal)" />
        <path d="M0 70 C40 68 55 40 90 48 C120 56 140 22 180 28 C220 34 240 50 280 24 C300 12 312 18 320 10" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
        <defs>
          <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="rounded-full border border-slate-200 py-2.5 text-sm">
          Deposit
        </button>
        <button type="button" className="rounded-full border border-slate-200 py-2.5 text-sm">
          Swap
        </button>
      </div>
    </section>
  );
}
