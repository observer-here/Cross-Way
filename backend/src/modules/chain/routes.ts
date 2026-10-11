import { Hono } from "hono";

import type { AppEnv } from "../../env";

import { invoiceIdFromTx, loadInvoice, loadWalletHome } from "./wallet";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const chainRoutes = new Hono<AppEnv>()
  .get("/health", (c) => c.json({ ok: true }))
  .get("/wallets/:addr", async (c) => {
    const addr = c.req.param("addr");
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return c.json({ error: "bad wallet" }, 400);
    const fresh = c.req.query("fresh") === "1";
    const cache = caches.default;
    const key = new Request(new URL(`/__cache/wallets/${addr.toLowerCase()}`, c.req.url).toString());
    if (!fresh) {
      const hit = await cache.match(key);
      if (hit) return new Response(hit.body, { headers: { ...JSON_HEADERS, "Cache-Control": "no-cache", "X-Cache": "HIT" } });
    }
    const body = JSON.stringify(await loadWalletHome(c.env, addr));
    c.executionCtx.waitUntil(cache.put(key, new Response(body, { headers: { ...JSON_HEADERS, "Cache-Control": "public, max-age=30" } })));
    return new Response(body, { headers: { ...JSON_HEADERS, "Cache-Control": "no-cache", "X-Cache": "MISS" } });
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
