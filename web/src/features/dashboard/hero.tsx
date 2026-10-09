import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="grid items-center gap-6 px-6 pt-4 pb-2 md:grid-cols-[1fr_1.05fr] lg:px-16">
      <div className="max-w-xl">
        <p className="text-[11px] tracking-[0.32em] text-slate-400">PAYMENTS MADE SIMPLE</p>
        <h1 className="mt-4 text-5xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
          Send. Request.
          <br />
          <span className="bg-linear-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">Anyone. Anywhere.</span>
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-500">
          Send and receive ERC-20 tokens using a username, email, EVM address or user ID on Arc Testnet.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/send" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">
            Send Payment →
          </Link>
          <Link to="/request" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium shadow-sm">
            Request Payment
          </Link>
        </div>
      </div>
      <div className="relative mx-auto h-[320px] w-full max-w-[480px]">
        <div className="absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60" />
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/35" />
        <div className="glass-x absolute top-1/2 left-1/2 grid h-40 w-40 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem]">
          <span className="rotate-[18deg] bg-linear-to-br from-indigo-600 to-violet-500 bg-clip-text text-7xl font-black text-transparent">X</span>
        </div>
        <Orb className="top-6 left-16">@</Orb>
        <Orb className="top-10 right-14">✉</Orb>
        <Orb className="bottom-16 left-8">⧉</Orb>
        <Orb className="right-10 bottom-12">☺</Orb>
      </div>
    </section>
  );
}

function Orb({ className, children }: { className: string; children: string }) {
  return (
    <span className={`chip absolute grid h-11 w-11 place-items-center rounded-full text-sm text-violet-500 ${className}`}>
      {children}
    </span>
  );
}
