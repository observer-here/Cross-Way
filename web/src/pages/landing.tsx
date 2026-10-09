import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { ARC } from "@/chain/arc";
import { shortAddress } from "@/lib/format";
import { Logo } from "@/shared/ui/logo";

const nav = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how", label: "How It Works" },
  { href: "#security", label: "Security" },
  { href: "#docs", label: "Docs" },
];

export function LandingPage() {
  return (
    <div id="home" className="landing-sky min-h-screen text-slate-800">
      <header className="flex items-center gap-4 px-5 py-5 lg:px-10">
        <Logo />
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 text-sm whitespace-nowrap text-slate-500 md:flex">
          <a href="#home" className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-slate-800 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Home
          </a>
          {nav.slice(1).map((item) => (
            <a key={item.href} href={item.href} className={`hover:text-slate-800 ${item.label === "Security" || item.label === "Docs" ? "hidden lg:inline" : ""}`}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-sm whitespace-nowrap text-slate-600 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Arc Testnet
            <span className="text-slate-400">▾</span>
          </span>
          <Link to="/app" className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium whitespace-nowrap text-white">
            Launch App ↗
          </Link>
        </div>
      </header>

      <section className="grid items-center gap-6 px-6 pt-8 pb-6 md:grid-cols-[1fr_1.05fr] lg:px-16 lg:pt-14">
        <div className="max-w-xl">
          <p className="text-[11px] tracking-[0.32em] text-slate-400">PAYMENTS ON ARC</p>
          <h1 className="mt-4 text-5xl leading-[1.05] font-extrabold tracking-tight md:text-6xl">
            Send. Request.
            <br />
            <span className="bg-linear-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">Anyone. Anywhere.</span>
          </h1>
          <p className="mt-5 text-[15px] leading-7 text-slate-500">
            CROSS WAY makes crypto payments simple.
            <br />
            Send and receive ERC-20 tokens using a username, email,
            <br />
            EVM address or user ID — on Arc Testnet.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/app" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white">
              Launch App ↗
            </Link>
            <a href="#how" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium shadow-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-900 text-[10px] text-white">▶</span>
              Watch Demo
            </a>
          </div>
        </div>
        <HeroVisual />
      </section>

      <section id="features" className="grid gap-8 px-6 py-6 sm:grid-cols-2 md:grid-cols-4 lg:px-16">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${f.bg}`}>{f.icon}</span>
            <div>
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-500">{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      <section id="how" className="px-6 py-8 lg:px-16">
        <div className="rounded-[2rem] bg-white/80 px-6 py-10 shadow-[0_20px_60px_rgb(80_90_160_/_0.08)] lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-violet-400">HOW IT WORKS</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                Payments in <span className="text-violet-500">3 simple steps</span>
              </h2>
            </div>
            <p className="max-w-xs text-right text-sm text-slate-400">
              No complicated addresses.
              <br />
              Just people, tokens and payments.
            </p>
          </div>
          <div className="mt-10 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {steps.map((s, i) => (
              <div key={s.title} className="contents">
                <div className="flex items-center gap-4 rounded-3xl bg-slate-50 px-5 py-5">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-500 text-xs font-bold text-white">{i + 1}</span>
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${s.bg}`}>{s.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-sm text-slate-500">{s.desc}</p>
                  </div>
                </div>
                {i < 2 && <span className="hidden text-slate-300 md:block">→</span>}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/app" className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white">
              Get Started ↗
            </Link>
          </div>
        </div>
      </section>

      <footer id="security" className="flex flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-slate-400 lg:px-16">
        <p>Arc Testnet only. USDC for gas. Contract {shortAddress(ARC.contract)}.</p>
        <a id="docs" href={`${ARC.explorer}/address/${ARC.contract}`} className="text-indigo-500">
          Explorer ↗
        </a>
      </footer>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[380px] w-full max-w-[520px]">
      <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/50" />
      <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />
      <div className="glass-x absolute top-1/2 left-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem]">
            <span className="rotate-[18deg] bg-linear-to-br from-indigo-600 to-violet-500 bg-clip-text text-7xl font-black text-transparent drop-shadow">X</span>
      </div>
      <Chip className="top-8 left-8" icon={<UserIcon />} text="@alice" />
      <Chip className="top-24 right-4" icon={<MailIcon />} text="alice@email.com" />
      <Chip className="bottom-24 left-2" icon={<WalletIcon />} text="0x3aF2...7dE1" />
      <Chip className="right-10 bottom-16" icon={<UserIcon />} text="user_1024" />
      <p className="absolute right-0 bottom-2 font-script text-xl leading-6 text-sky-700/80">
        Same
        <br />
        Network.
        <br />
        More People.
        <br />
        Easier Payments.
      </p>
    </div>
  );
}

function Chip({ className, icon, text }: { className: string; icon: ReactNode; text: string }) {
  return (
    <span className={`chip absolute flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${className}`}>
      {icon}
      {text}
    </span>
  );
}

const icon = "h-5 w-5";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-violet-500">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 14.5-4 16 0" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={`${icon} fill-none stroke-emerald-500`} strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}
function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" className={`${icon} fill-none stroke-sky-500`} strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

const features = [
  {
    title: "Send to Anyone",
    desc: "Use username, email, EVM address or user ID.",
    bg: "bg-sky-100 text-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" />
      </svg>
    ),
  },
  {
    title: "Request Payments",
    desc: "Request tokens from anyone, easily.",
    bg: "bg-fuchsia-100 text-fuchsia-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" className="stroke-white" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    title: "Share Payment Links",
    desc: "Generate and share payment links.",
    bg: "bg-emerald-100 text-emerald-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
  },
  {
    title: "Scan & Pay",
    desc: "Pay or receive with QR codes.",
    bg: "bg-orange-100 text-orange-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4z" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Find a recipient",
    desc: "Using a username, email, EVM address or user ID.",
    bg: "bg-violet-100 text-violet-500",
    icon: <UserIcon />,
  },
  {
    title: "Enter amount",
    desc: "Choose your token and enter the amount.",
    bg: "bg-indigo-100 text-indigo-500",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
        <ellipse cx="12" cy="8" rx="7" ry="3" />
        <path d="M5 8v4c0 1.6 3 3 7 3s7-1.4 7-3V8M5 12v4c0 1.6 3 3 7 3s7-1.4 7-3v-4" />
      </svg>
    ),
  },
  {
    title: "Send or request",
    desc: "Confirm and complete your payment.",
    bg: "bg-sky-100 text-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
        <path d="M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" />
      </svg>
    ),
  },
];
