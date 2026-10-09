import { usePrivy } from "@privy-io/react-auth";
import { Navigate, useLocation } from "react-router-dom";

import { env } from "@/config/env";
import { Layout } from "@/app/layout";

export function RequireAuth() {
  const loc = useLocation();
  if (!env.privyAppId) {
    return <Navigate to="/login" replace />;
  }
  return <Gate from={loc.pathname} />;
}

function Gate({ from }: { from: string }) {
  const { ready, authenticated } = usePrivy();
  if (!ready) return <div className="app-sky min-h-screen" />;
  if (!authenticated) return <Navigate to="/login" replace state={{ from }} />;
  return <Layout />;
}
