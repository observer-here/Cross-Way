export function Receive() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Receive Payment</h2>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/50">USDC</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="relative grid h-28 w-28 place-items-center rounded-xl bg-white p-2">
          <div className="grid h-full w-full grid-cols-5 grid-rows-5 gap-0.5">
            {Array.from({ length: 25 }, (_, i) => (
              <span key={i} className={i === 12 ? "bg-white" : i % 3 === 0 ? "bg-zinc-950" : "bg-white"} />
            ))}
          </div>
          <span className="absolute grid h-7 w-7 place-items-center rounded-md bg-linear-to-br from-violet-400 to-indigo-600 text-[11px] font-black text-white">
            X
          </span>
        </div>
        <div>
          <p className="text-xs text-white/40">Your Address</p>
          <p className="mt-1 font-mono text-sm">0x3af2…7dE1</p>
          <p className="mt-2 text-xs text-white/35">Scan this QR code to receive payments on Arc Testnet.</p>
        </div>
      </div>
    </section>
  );
}
