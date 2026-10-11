import { useEffect, useState } from "react";

const tones = ["bg-violet-500", "bg-sky-500", "bg-emerald-500", "bg-orange-400", "bg-indigo-500"];
const sizes = { xs: "h-7 w-7 text-[10px]", sm: "h-8 w-8 text-[11px]", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

export function Avatar({ name, src, size = "md", tone }: { name: string; src?: string; size?: keyof typeof sizes; tone?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const box = `shrink-0 rounded-full ${sizes[size]}`;
  if (src && !failed) return <img src={src} alt="" onError={() => setFailed(true)} className={`${box} object-cover`} />;
  const clean = name.replace(/^@/, "").trim() || "?";
  const color = tone ?? tones[clean.charCodeAt(0) % tones.length];
  return <span className={`grid place-items-center font-semibold text-white ${color} ${box}`}>{clean[0].toUpperCase()}</span>;
}

export function PersonChip({ label, sub, src, onClear }: { label: string; sub?: string; src?: string; onClear?: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2.5">
      <Avatar name={label} src={src} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        {sub && <p className="truncate font-mono text-[11px] text-slate-400">{sub}</p>}
      </div>
      {onClear && (
        <button type="button" onClick={onClear} className="text-lg leading-none text-slate-400">
          ×
        </button>
      )}
    </div>
  );
}
