import { Hono } from "hono";

import type { AppEnv } from "../../env";

export const chainRoutes = new Hono<AppEnv>()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/config", (c) =>
    c.json({
      chainId: Number(c.env.CHAIN_ID),
      rpcUrl: c.env.RPC_URL,
      contract: c.env.CONTRACT_ADDRESS,
      usdc: c.env.USDC,
      eurc: c.env.EURC,
    }),
  );
