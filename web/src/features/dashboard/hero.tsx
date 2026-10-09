import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="hero-glow relative overflow-hidden px-6 pt-4 pb-8 lg:px-8">
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs tracking-[0.35em] text-white/45">CROSS WAY</p>
          <h1 className="mt-4 max-w-xl text-5xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
            Payments
            <br />
            without <span className="bg-linear-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">limits</span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/55">
            Send, request and receive ERC-20 tokens using a username, email, EVM address or user ID on Arc Testnet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/send" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950">
              Send Payment →
            </Link>
            <Link to="/request" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white">
              Request Payment →
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-3 text-xs text-white/45">
            <div className="flex -space-x-2">
              {["#7c5cff", "#38bdf8", "#f472b6", "#34d399"].map((c) => (
                <span key={c} className="h-7 w-7 rounded-full border-2 border-[#070b18]" style={{ background: c }} />
              ))}
            </div>
            Trusted by builders on Arc
            <span className="text-white/25">Fast · Simple · Secure</span>
          </div>
        </div>
        <div className="relative min-h-[340px]">
          <div className="planet absolute top-2 right-6 h-72 w-72 rounded-full opacity-90" />
          <p className="absolute top-4 right-10 font-script text-xl text-violet-200/85">Multiple Ways to Pay</p>
          <p className="absolute top-24 left-2 max-w-[150px] font-script text-lg leading-6 text-white/70">
            Same Network More People Easier Payments.
          </p>
          <div className="glass-cube absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl" />
          <div className="absolute top-1/2 left-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl bg-linear-to-br from-violet-300 to-indigo-600 text-4xl font-black shadow-lg">
            X
          </div>
          <div className="panel absolute right-0 bottom-2 w-56 p-4">
            <p className="text-sm font-medium">Send to anyone</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-white/70">
              {["Username", "Email", "EVM Address", "User ID"].map((item) => (
                <span key={item} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
