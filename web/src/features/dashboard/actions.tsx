import { Link } from "react-router-dom";

const items = [
  { to: "/send", title: "Send", desc: "Send tokens to anyone", bg: "bg-sky-50", icon: "➤", color: "text-sky-500" },
  { to: "/request", title: "Request", desc: "Request tokens from users", bg: "bg-fuchsia-50", icon: "▦", color: "text-fuchsia-500" },
  { to: "/links", title: "Payment Link", desc: "Create a shareable link", bg: "bg-emerald-50", icon: "⚭", color: "text-emerald-500" },
  { to: "/pay/scan", title: "Scan QR", desc: "Pay or receive via QR", bg: "bg-orange-50", icon: "▣", color: "text-orange-400" },
];

export function Actions() {
  return (
    <div className="grid gap-3 px-6 sm:grid-cols-2 md:grid-cols-4 lg:px-16">
      {items.map((item) => (
        <Link key={item.title} to={item.to} className="panel flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-2xl text-lg ${item.bg} ${item.color}`}>{item.icon}</span>
            <span>
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="text-xs text-slate-400">{item.desc}</span>
            </span>
          </span>
          <span className="text-slate-300">›</span>
        </Link>
      ))}
    </div>
  );
}
