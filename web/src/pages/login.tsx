import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { env } from "@/config/env";
import { Logo } from "@/shared/ui/logo";

export function LoginPage() {
  if (!env.privyAppId) {
    return (
      <main className="app-sky flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <Logo />
        <p className="mt-6 max-w-sm text-sm text-slate-500">
          Add your Privy app ID to <code className="text-slate-800">web/.env</code> as <code>VITE_PRIVY_APP_ID</code>, and the app
          secret on the Cloudflare worker.
        </p>
      </main>
    );
  }
  return <EmailLogin />;
}

function EmailLogin() {
  const { ready, authenticated } = usePrivy();
  const nav = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/app";
  const { login } = useLogin({ onComplete: () => nav(from, { replace: true }) });

  useEffect(() => {
    if (ready && authenticated) nav(from, { replace: true });
  }, [ready, authenticated, from, nav]);

  if (!ready) return <main className="app-sky min-h-screen" />;
  if (authenticated) return <Navigate to={from} replace />;

  return (
    <main className="app-sky flex min-h-screen flex-col items-center justify-center px-6">
      <Logo />
      <p className="mt-4 text-sm text-slate-500">Sign in with email. A wallet is created for you.</p>
      <button
        type="button"
        onClick={() => login({ loginMethods: ["email"] })}
        className="mt-8 w-full max-w-sm rounded-full bg-slate-950 py-3 text-sm font-medium text-white"
      >
        Continue with email
      </button>
    </main>
  );
}
