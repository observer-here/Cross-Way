import { createPublicClient, http } from "viem";

import { arcChain } from "./arc";

export const publicClient = createPublicClient({
  chain: arcChain,
  transport: http(),
});
