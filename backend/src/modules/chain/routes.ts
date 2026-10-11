import { Hono } from "hono";

import type { AppEnv } from "../../env";

import { invoiceIdFromTx, loadInvoice, loadWalletHome } from "./wallet";

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
  )
  .get("/wallets/:addr", async (c) => {
    const addr = c.req.param("addr");
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return c.json({ error: "bad wallet" }, 400);
    const fresh = c.req.query("fresh") === "1";
    const cache = caches.default;
    const key = new Request(new URL(`/__cache/wallets/${addr.toLowerCase()}`, c.req.url).toString());
    if (!fresh) {
      const hit = await cache.match(key);
      if (hit) {
        return new Response(hit.body, {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=15", "X-Cache": "HIT" },
        });
      }
    }
    const data = await loadWalletHome(c.env, addr);
    const body = JSON.stringify(data);
    if (!fresh) {
      c.executionCtx.waitUntil(
        cache.put(key, new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=30" } })),
      );
    }
    return c.json(data, 200, fresh ? { "Cache-Control": "no-store", "X-Cache": "MISS" } : { "Cache-Control": "public, max-age=15", "X-Cache": "MISS" });
  })
  .get("/invoices/:id", async (c) => {
    const id = c.req.param("id");
    if (!/^\d+$/.test(id)) return c.json({ error: "bad id" }, 400);
    const row = await loadInvoice(c.env, id);
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json(row);
  })
  .get("/tx/:hash/invoice-id", async (c) => {
    const hash = c.req.param("hash");
    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) return c.json({ error: "bad hash" }, 400);
    return c.json({ id: await invoiceIdFromTx(c.env, hash) }, 200, { "Cache-Control": "no-store" });
  });
