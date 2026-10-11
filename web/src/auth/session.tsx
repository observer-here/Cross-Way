import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Address } from "viem";

import { ApiError } from "@/api/client";
import type { User } from "@/api/types";
import { getMe, syncMe } from "@/api/users";

const ME_KEY = "cw-me";

function readCache(): User | null {
  try {
    const raw = localStorage.getItem(ME_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function writeCache(user: User | null) {
  try {
    if (user) localStorage.setItem(ME_KEY, JSON.stringify(user));
    else localStorage.removeItem(ME_KEY);
  } catch {
    /* ignore */
  }
}

type Session = {
  me: User | null;
  wallet: Address | undefined;
  error: string;
  setMe: (user: User | null) => void;
};

const Ctx = createContext<Session>({ me: null, wallet: undefined, error: "", setMe: () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [me, setMeState] = useState<User | null>(readCache);
  const [error, setError] = useState("");
  const privyWallet = wallets.find((w) => w.walletClientType === "privy")?.address as Address | undefined;
  const wallet = (me?.wallet as Address | undefined) ?? privyWallet;

  function setMe(user: User | null) {
    setMeState(user);
    writeCache(user);
  }

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      setMe(null);
      setError("");
      return;
    }
    let alive = true;
    (async () => {
      try {
        const token = await getAccessToken();
        if (!token || !alive) return;
        let user: User;
        try {
          user = await getMe(token);
        } catch (e) {
          if (!(e instanceof ApiError) || e.status !== 404) throw e;
          user = await syncMe(token);
        }
        if (!alive) return;
        setMe(user);
        setError("");
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "sync failed");
      }
    })();
    return () => {
      alive = false;
    };
  }, [ready, authenticated, getAccessToken]);

  return <Ctx.Provider value={{ me, wallet, error, setMe }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}
