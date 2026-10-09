import { tokens } from "./data";

export function Balance() {
  return (
    <section className="panel p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/45">Your Balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">$152.60</p>
          <p className="mt-1 text-xs text-emerald-400">▲ 12.4% (24h)</p>
        </div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-white/50">USD</span>
      </div>
      <svg viewBox="0 0 320 72" className="mt-4 h-16 w-full">
        <path
          d="M0 50 C40 48 50 20 80 28 C110 36 120 12 160 18 C200 24 210 40 250 22 C280 10 300 18 320 8"
          fill="none"
          stroke="#8b7cff"
          strokeWidth="2.5"
        />
        <path d="M0 50 C40 48 50 20 80 28 C110 36 120 12 160 18 C200 24 210 40 250 22 C280 10 300 18 320 8 V72 H0 Z" fill="url(#bal)" />
        <defs>
          <linearGradient id="bal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b7cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b7cff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <ul className="mt-2 space-y-3 text-sm">
        {tokens.map((t) => (
          <li key={t.symbol} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold" style={{ background: t.color }}>
                {t.symbol[0]}
              </span>
              <span>
                <span className="block">{t.symbol}</span>
                <span className="text-xs text-white/40">{t.name}</span>
              </span>
            </span>
            <span className="text-right">
              <span className="block">{t.amount}</span>
              <span className="text-xs text-white/40">{t.usd}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" className="rounded-xl border border-white/10 py-2 text-sm">
          Deposit
        </button>
        <button type="button" className="rounded-xl border border-white/10 py-2 text-sm">
          Swap
        </button>
      </div>
    </section>
  );
}
