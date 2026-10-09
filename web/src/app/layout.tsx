import { NavLink, Outlet } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

import { useSession } from "@/auth/session";
import { labelOf } from "@/lib/format";
import { Logo } from "@/shared/ui/logo";

const links = [
  { to: "/app", label: "Home", end: true },
  { to: "/send", label: "Send" },
  { to: "/request", label: "Request" },
  { to: "/links", label: "Links" },
];

export function Layout() {
  const { logout } = usePrivy();
  const { me, wallet } = useSession();
  const name = labelOf(me?.email, me?.username, wallet);

  return (
    <div className="app-sky min-h-screen text-slate-800">
      <header className="relative flex items-center justify-between px-5 py-5 lg:px-10">
        <Logo to="/app" />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-sm whitespace-nowrap text-slate-500 lg:flex">
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
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm whitespace-nowrap text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Arc Testnet
          </span>
          <NavLink to="/settings" className="flex items-center gap-2 rounded-full bg-white/80 py-1 pr-3 pl-1">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-xs font-semibold text-white">
              {name[0]?.toUpperCase() ?? "?"}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:block">{name}</span>
          </NavLink>
          <button type="button" onClick={() => logout()} className="text-xs text-slate-400">
            Log out
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
