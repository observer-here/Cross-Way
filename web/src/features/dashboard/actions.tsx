import { Link } from "react-router-dom";

const items = [
  { to: "/send", title: "Send", desc: "Send tokens instantly", bg: "bg-sky-50 text-sky-500", icon: "M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" },
  { to: "/request", title: "Request", desc: "Request from anyone", bg: "bg-fuchsia-50 text-fuchsia-500", icon: "M7 4h10a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 2-2z" },
  { to: "/links", title: "Create Link", desc: "Generate payment links", bg: "bg-emerald-50 text-emerald-500", stroke: true, icon: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" },
  { to: "/scan", title: "Scan QR", desc: "Pay or receive via QR", bg: "bg-orange-50 text-orange-400", icon: "M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4z" },
];

export function Actions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link key={item.title} to={item.to} className="panel flex items-center gap-3 px-4 py-3.5">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.bg}`}>
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${item.stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth={item.stroke ? 2 : undefined}>
              <path d={item.icon} />
            </svg>
          </span>
          <span>
            <span className="block text-sm font-semibold">{item.title}</span>
            <span className="text-xs text-slate-400">{item.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
