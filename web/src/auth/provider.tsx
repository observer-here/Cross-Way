import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

import { env } from "@/config/env";
import { arcChain } from "@/chain/arc";

import { SessionProvider } from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  if (!env.privyAppId) return children;
  return (
    <PrivyProvider
      appId={env.privyAppId}
      config={{
        loginMethods: ["email"],
        appearance: { theme: "light", accentColor: "#4f46e5" },
        defaultChain: arcChain,
        supportedChains: [arcChain],
        embeddedWallets: { ethereum: { createOnLogin: "all-users" } },
      }}
    >
      <SessionProvider>{children}</SessionProvider>
    </PrivyProvider>
  );
}
