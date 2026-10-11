export function Caret({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={`h-3 w-3 fill-none stroke-slate-600 ${className}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" />
    </svg>
  );
}
