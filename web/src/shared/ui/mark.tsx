import type { ReactNode } from "react";

export function GlassX({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-x grid h-40 w-40 place-items-center rounded-[2rem] ${className}`}>
      <span className="rotate-[18deg] bg-linear-to-br from-indigo-600 to-violet-500 bg-clip-text text-7xl font-black text-transparent">X</span>
    </div>
  );
}

export function SideMark({ text, children }: { text: string; children?: ReactNode }) {
  return (
    <div className="relative hidden min-h-[460px] lg:block">
      <div className="absolute top-16 left-2">{children ?? <GlassX />}</div>
      <p className="font-script absolute bottom-10 left-0 max-w-[200px] text-[28px] leading-8 text-indigo-400/90">{text}</p>
    </div>
  );
}

export function SoftIcon({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`grid h-14 w-14 place-items-center rounded-2xl ${className}`}>{children}</span>;
}

export function qrSrc(data: string, size = 220) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
