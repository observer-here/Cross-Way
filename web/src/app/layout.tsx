import { NavLink, Outlet } from "react-router-dom";

import { avatarSrc } from "@/api/users";
import { useSession } from "@/auth/session";
import { labelOf } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Logo } from "@/shared/ui/logo";

const links = [
  { to: "/app", label: "Home", end: true, icon: "M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" },
  { to: "/send", label: "Send", icon: "M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" },
  { to: "/request", label: "Request", icon: "M5 4h14v12H5z M8 20h8" },
  { to: "/links", label: "Links", icon: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" },
];
const mobile = [
  ...links,
  { to: "/scan", label: "Scan", icon: "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8z" },
];

export function Layout() {
  const { me, wallet } = useSession();
  const name = labelOf(me?.email, me?.username, wallet);

  return (
    <div className="app-sky min-h-screen text-slate-800">
      <header className="relative flex items-center justify-between px-5 py-5 lg:px-10">
        <Logo to="/app" />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 text-sm whitespace-nowrap text-slate-500 lg:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-1.5 ${isActive ? "bg-white text-indigo-500 shadow-sm" : "hover:text-slate-800"}`
              }
            >
              <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 ${item.label === "Links" ? "fill-none stroke-current" : "fill-current"}`} strokeWidth={item.label === "Links" ? 2 : undefined}>
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Arc Testnet
          </span>
          <NavLink to="/settings" className="flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 shadow-sm">
            <Avatar name={name} src={avatarSrc(me)} size="xs" />
            <span className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:block">{name}</span>
          </NavLink>
        </div>
      </header>
      <nav className="flex gap-2 overflow-x-auto px-5 pb-3 text-sm text-slate-500 lg:hidden">
        {mobile.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `shrink-0 rounded-full px-3 py-1.5 ${isActive ? "bg-white text-slate-800 shadow-sm" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
