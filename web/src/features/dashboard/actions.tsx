import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const items: { to: string; title: string; desc: string; bg: string; color: string; icon: ReactNode }[] = [
  {
    to: "/send",
    title: "Send",
    desc: "Send tokens to anyone",
    bg: "bg-sky-50",
    color: "text-sky-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" />
      </svg>
    ),
  },
  {
    to: "/request",
    title: "Request",
    desc: "Request tokens from users",
    bg: "bg-fuchsia-50",
    color: "text-fuchsia-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <rect x="5" y="4" width="14" height="16" rx="2" />
      </svg>
    ),
  },
  {
    to: "/links",
    title: "Payment Link",
    desc: "Create a shareable link",
    bg: "bg-emerald-50",
    color: "text-emerald-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
  },
  {
    to: "/pay/scan",
    title: "Scan QR",
    desc: "Pay or receive via QR",
    bg: "bg-orange-50",
    color: "text-orange-400",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4z" />
      </svg>
    ),
  },
];

export function Actions() {
  return (
    <div className="grid gap-3 px-6 sm:grid-cols-2 md:grid-cols-4 lg:px-16">
      {items.map((item) => (
        <Link key={item.title} to={item.to} className="panel flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-2xl ${item.bg} ${item.color}`}>{item.icon}</span>
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
