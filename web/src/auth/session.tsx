import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Address } from "viem";

import { syncMe } from "@/api/users";
import type { User } from "@/api/types";

type Session = {
  me: User | null;
  wallet: Address | undefined;
  error: string;
};

const Ctx = createContext<Session>({ me: null, wallet: undefined, error: "" });

export function SessionProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [me, setMe] = useState<User | null>(null);
  const [error, setError] = useState("");
  const wallet = wallets.find((w) => w.walletClientType === "privy")?.address as Address | undefined;

  useEffect(() => {
    if (!ready || !authenticated || !wallet) {
      setMe(null);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token || !alive) return;
        const user = await syncMe(token);
        if (alive) {
          setMe(user);
          setError("");
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "sync failed");
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, authenticated, wallet, getAccessToken]);

  return <Ctx.Provider value={{ me, wallet, error }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}
