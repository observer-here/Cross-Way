import { createContext, useContext, useState, type ReactNode } from "react";

const KEY = "cw-theme";

function apply(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

const Ctx = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  function toggle() {
    const next = !dark;
    setDark(next);
    apply(next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return <Ctx.Provider value={{ dark, toggle }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { dark, toggle } = useTheme();
  return (
    <button type="button" onClick={toggle} className={`grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm ${className}`} aria-label={dark ? "Light theme" : "Dark theme"}>
      {dark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v1.6M12 19.4V21M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3 12h1.6M19.4 12H21M4.9 19.1 6 18M18 6l1.1-1.1" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <path d="M18 13.5A7 7 0 1 1 10.5 6 5.5 5.5 0 0 0 18 13.5z" />
        </svg>
      )}
    </button>
  );
}

