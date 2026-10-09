import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const items: { to: string; title: string; desc: string; color: string; icon: ReactNode }[] = [
  {
    to: "/send",
    title: "Send",
    desc: "Send tokens to anyone",
    color: "bg-blue-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
        <path d="M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" />
      </svg>
    ),
  },
  {
    to: "/request",
    title: "Request",
    desc: "Request tokens from users",
    color: "bg-violet-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-7-3-7 3V5a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
  {
    to: "/request",
    title: "Payment Link",
    desc: "Create a shareable link",
    color: "bg-emerald-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-white" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
  },
  {
    to: "/pay/1",
    title: "Scan QR",
    desc: "Pay or receive via QR",
    color: "bg-orange-400",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4zm6-4h2v2h-2v-2zm-4 0h2v2h-2v-2z" />
      </svg>
    ),
  },
];

export function Actions() {
  return (
    <div className="grid gap-3 px-6 sm:grid-cols-2 md:grid-cols-4 lg:px-8">
      {items.map((item) => (
        <Link key={item.title} to={item.to} className="panel flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.color}`}>{item.icon}</span>
            <span>
              <span className="block text-sm font-semibold">{item.title}</span>
              <span className="text-xs text-white/45">{item.desc}</span>
            </span>
          </div>
          <span className="text-white/30">→</span>
        </Link>
      ))}
    </div>
  );
}
