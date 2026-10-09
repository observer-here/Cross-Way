import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center">
        <span className="absolute h-7 w-2.5 rotate-45 rounded-md bg-indigo-500" />
        <span className="absolute h-7 w-2.5 -rotate-45 rounded-md bg-violet-400" />
      </span>
      <span className="text-sm font-semibold tracking-[0.16em] whitespace-nowrap text-slate-800">CROSS WAY</span>
    </Link>
  );
}
