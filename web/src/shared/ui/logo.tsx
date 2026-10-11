import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 lg:gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center lg:h-10 lg:w-10">
        <span className="absolute h-7 w-2.5 rotate-45 rounded-full bg-linear-to-b from-violet-500 to-blue-500 shadow-sm lg:h-9 lg:w-3.5" />
        <span className="absolute h-7 w-2.5 -rotate-45 rounded-full bg-linear-to-b from-fuchsia-400 to-indigo-500 opacity-90 shadow-sm lg:h-9 lg:w-3.5" />
      </span>
      <span className="text-sm font-bold tracking-wide whitespace-nowrap text-slate-900 lg:text-lg">CROSS WAY</span>
    </Link>
  );
}
