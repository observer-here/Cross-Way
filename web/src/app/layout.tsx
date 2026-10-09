import { NavLink, Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#070b18] text-white">
      <header className="flex items-center gap-4 px-6 py-4 lg:px-8">
        <NavLink to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-violet-400 to-indigo-600 text-sm font-bold">
            X
          </span>
          <span className="text-sm font-semibold tracking-[0.18em]">CROSS WAY</span>
        </NavLink>
        <label className="relative mx-auto min-w-0 flex-1 max-w-xl">
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-white/35">⌕</span>
          <input
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pr-12 pl-9 text-sm outline-none placeholder:text-white/35 focus:border-violet-400/50"
            placeholder="Search username, email, address or user ID..."
          />
          <kbd className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/10 px-1.5 text-[10px] text-white/40">
            ⌘K
          </kbd>
        </label>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70">Arc Testnet</span>
          <button className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70" type="button">
            ⌁
          </button>
          <NavLink to="/settings" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pr-3 pl-1">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-xs font-semibold">K</span>
            <span className="hidden sm:block text-white/80">@kashifdev</span>
          </NavLink>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
