import { Link } from "react-router-dom";

const items = [
  { to: "/send", title: "Send", desc: "Send tokens to anyone", bg: "bg-indigo-50 text-indigo-500", icon: "M3.2 11.4 20.6 3.4l-7.2 17.2-2.5-6.8L3.2 11.4z" },
  { to: "/request", title: "Request", desc: "Request from users", bg: "bg-fuchsia-50 text-fuchsia-500", stroke: true, icon: "M8 3.2v2.2M16 3.2v2.2M5 8.6h14M7 5h10a2 2 0 0 1 2 2v11.2A1.6 1.6 0 0 1 17.4 20H6.6A1.6 1.6 0 0 1 5 18.2V7a2 2 0 0 1 2-2z" },
  { to: "/links", title: "Create Link", desc: "Generate payment link", bg: "bg-emerald-50 text-emerald-500", stroke: true, icon: "M10 13.2a4.6 4.6 0 0 0 6.4 0l1.8-1.8a4.6 4.6 0 0 0-6.5-6.5l-.9.9M14 10.8a4.6 4.6 0 0 0-6.4 0l-1.8 1.8a4.6 4.6 0 0 0 6.5 6.5l.9-.9" },
  { to: "/scan", title: "Scan QR", desc: "Pay or receive via QR", bg: "bg-orange-50 text-orange-400", icon: "M4 4h6.2v6.2H4V4zm9.8 0H20v6.2h-6.2V4zM4 13.8h6.2V20H4v-6.2zm9.8 2.4H16V20h-2.2v-3.8zm2.4 0H20V18h-3.8v-1.8zM13.8 18H16V20h-2.2z" },
];

export function Actions() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map((item) => (
        <Link key={item.title} to={item.to} className="dash-card flex flex-col items-start gap-3 px-4 py-3.5 sm:flex-row sm:items-center">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${item.bg}`}>
            <svg viewBox="0 0 24 24" className={`h-5 w-5 ${item.stroke ? "fill-none stroke-current" : "fill-current"}`} strokeWidth={item.stroke ? 1.8 : undefined} strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">{item.title}</span>
            <span className="block text-xs text-slate-400 sm:truncate">{item.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
