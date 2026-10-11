import { useEffect, useState } from "react";

import { useSession } from "@/auth/session";

import { loadBalances, type Balances } from "./read";

export function useBalances() {
  const { wallet } = useSession();
  const [data, setData] = useState<Balances | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    setErr("");
    loadBalances(wallet)
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet]);

  return { wallet, data, err };
}
