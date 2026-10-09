import { NavLink, Outlet } from "react-router-dom";

const links = [
  { to: "/send", label: "Send" },
  { to: "/request", label: "Request" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
];

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4">
        <NavLink to="/" className="text-sm font-semibold tracking-tight">
          CrossWay
        </NavLink>
        <nav className="flex gap-6 text-sm text-zinc-500">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? "text-zinc-950" : "hover:text-zinc-950")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
