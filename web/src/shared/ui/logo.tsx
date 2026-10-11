import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center">
        <span className="absolute h-9 w-3.5 rotate-45 rounded-full bg-linear-to-b from-violet-500 to-blue-500 shadow-sm" />
        <span className="absolute h-9 w-3.5 -rotate-45 rounded-full bg-linear-to-b from-fuchsia-400 to-indigo-500 opacity-90 shadow-sm" />
      </span>
      <span className="text-lg font-bold tracking-wide whitespace-nowrap text-slate-900">CROSS WAY</span>
    </Link>
  );
}
