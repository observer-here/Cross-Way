import { NavLink, Outlet } from "react-router-dom";

import { Logo } from "@/shared/ui/logo";

const links = [
  { to: "/app", label: "Home", end: true },
  { to: "/send", label: "Send" },
  { to: "/request", label: "Request" },
  { to: "/links", label: "Links" },
];

export function Layout() {
  return (
    <div className="app-sky min-h-screen text-slate-800">
      <header className="flex items-center gap-4 px-5 py-5 lg:px-10">
        <Logo to="/app" />
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-sm whitespace-nowrap text-slate-500 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-1.5 ${isActive ? "bg-white text-slate-800 shadow-sm" : "hover:text-slate-800"}`
              }
            >
              {item.label === "Home" && <span className="text-xs">⌂</span>}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm whitespace-nowrap text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Arc Testnet
            <span className="text-slate-400">▾</span>
          </span>
          <NavLink to="/settings" className="flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3 pl-1">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-xs font-semibold text-white">K</span>
            <span className="hidden text-sm text-slate-600 sm:block">@kashifdev</span>
            <span className="text-slate-400">▾</span>
          </NavLink>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
