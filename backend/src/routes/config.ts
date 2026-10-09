import { Hono } from "hono";

import type { Env } from "../types";

export const config = new Hono<{ Bindings: Env }>().get("/", (c) =>
  c.json({
    chainId: Number(c.env.CHAIN_ID),
    rpcUrl: c.env.RPC_URL,
    contract: c.env.CONTRACT_ADDRESS,
    usdc: c.env.USDC,
    eurc: c.env.EURC,
  }),
);
