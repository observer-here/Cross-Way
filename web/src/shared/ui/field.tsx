import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const control =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-indigo-300 lg:py-2.5";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs text-slate-400">
      {label}
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-[72px] resize-none lg:min-h-[88px] ${props.className ?? ""}`} />;
}

export function Submit({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="submit" {...props} className={`w-full rounded-full bg-slate-950 py-3 text-sm font-medium text-white disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}

export function Glow({ children, className = "", type = "submit", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={`w-full rounded-full bg-linear-to-r from-violet-500 to-sky-400 py-3 text-sm font-medium text-white disabled:opacity-40 lg:py-3.5 ${className}`}
    >
      {children}
    </button>
  );
}

export function TokenSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props}>
      <option value="USDC">USDC</option>
      <option value="EURC">EURC</option>
    </Select>
  );
}

export function DaysSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...props}>
      <option value="1">1 day</option>
      <option value="7">7 days</option>
      <option value="30">30 days</option>
    </Select>
  );
}
