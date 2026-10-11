import { NavLink, Outlet } from "react-router-dom";

import { avatarSrc } from "@/api/users";
import { useSession } from "@/auth/session";
import { labelOf } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Logo } from "@/shared/ui/logo";
import { ThemeToggle } from "@/theme";

const links = [
  { to: "/app", label: "Home", end: true, icon: "M4 10.2 12 3.6l8 6.6V20h-5.2v-5.4H9.2V20H4z" },
  { to: "/send", label: "Send", stroke: true, icon: "M4.2 11.6 20.2 4.2 13 19.8 10.8 13.2 4.2 11.6z" },
  { to: "/request", label: "Request", stroke: true, icon: "M8 3.5v2.2M16 3.5v2.2M5 9h14M7 5.2h10a2 2 0 0 1 2 2V19a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V7.2a2 2 0 0 1 2-2z" },
  { to: "/links", label: "Links", stroke: true, icon: "M9.5 14.2a4.2 4.2 0 0 0 6 0l1.6-1.6a4.2 4.2 0 0 0-6-6l-.8.8M14.5 9.8a4.2 4.2 0 0 0-6 0l-1.6 1.6a4.2 4.2 0 0 0 6 6l.8-.8" },
];

export function Layout() {
  const { me } = useSession();
  const name = labelOf(me?.username, me?.email);

  return (
    <div className="min-h-screen text-slate-800">
      <header className="relative flex items-center justify-between px-3 py-2.5 lg:px-10 lg:py-5">
        <Logo to="/app" />
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-3 lg:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-full px-4 py-2 text-sm whitespace-nowrap shadow-sm backdrop-blur-md ${isActive ? "bg-white text-indigo-600" : "bg-white/60 text-slate-500 hover:text-slate-800"}`
              }
            >
              <NavIcon item={item} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <span className="hidden items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm text-slate-600 shadow-sm sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Arc Testnet
            <Caret />
          </span>
          <NavLink to="/settings" className="flex shrink-0 items-center gap-1.5 rounded-full bg-white py-0.5 pr-2.5 pl-0.5 shadow-sm lg:gap-2 lg:py-1 lg:pr-3 lg:pl-1">
            <Avatar name={name} src={avatarSrc(me)} size="xs" tone="bg-violet-600" />
            <span className="max-w-[9.5rem] truncate text-xs text-slate-700 lg:max-w-[140px] lg:text-sm">{name}</span>
          </NavLink>
        </div>
      </header>
      <Outlet />
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-white/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-indigo-600" : "text-slate-400"}`}
          >
            <NavIcon item={item} className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function NavIcon({ item, className = "h-3.5 w-3.5" }: { item: (typeof links)[number]; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} ${item.stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth={item.stroke ? 1.8 : undefined} strokeLinecap="round" strokeLinejoin="round">
      <path d={item.icon} />
    </svg>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-none stroke-slate-400" strokeWidth="1.6" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}
