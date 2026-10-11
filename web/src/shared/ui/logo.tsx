import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 lg:gap-2.5">
      <img src="/logo.png" alt="" className="h-8 w-8 object-contain lg:h-10 lg:w-10" />
      <span className="text-sm font-bold tracking-wide whitespace-nowrap text-slate-900 lg:text-lg">CROSS WAY</span>
    </Link>
  );
}
