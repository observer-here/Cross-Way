import { useEffect, useState } from "react";

import { useSession } from "@/auth/session";

import { loadBalances } from "./read";

export function useBalances() {
  const { wallet } = useSession();
  const [data, setData] = useState<{ gas: string; usdc: string; eurc: string } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadBalances(wallet)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet]);

  return { wallet, data, err };
}
