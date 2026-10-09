import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom, type Address } from "viem";

import { ARC, arcChain } from "./arc";

export function useArcWallet() {
  const { wallets } = useWallets();
  const embedded = wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
  const address = embedded?.address as Address | undefined;

  async function client() {
    if (!embedded) throw new Error("no wallet");
    await embedded.switchChain(ARC.chainId);
    const provider = await embedded.getEthereumProvider();
    return createWalletClient({
      account: embedded.address as Address,
      chain: arcChain,
      transport: custom(provider),
    });
  }

  return { address, client };
}
