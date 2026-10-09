import { createMiddleware } from "hono/factory";
import { createRemoteJWKSet, jwtVerify } from "jose";

import type { AppVars, Env } from "../types";

export const privyAuth = createMiddleware<{ Bindings: Env; Variables: AppVars }>(async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return c.json({ error: "unauthorized" }, 401);
  try {
    const jwks = createRemoteJWKSet(new URL(`https://auth.privy.io/v1/apps/${c.env.PRIVY_APP_ID}/jwks.json`));
    const { payload } = await jwtVerify(token, jwks, { issuer: "privy.io", audience: c.env.PRIVY_APP_ID });
    const sub = String(payload.sub || "");
    if (!sub) return c.json({ error: "unauthorized" }, 401);
    c.set("userId", sub);
    await next();
  } catch {
    return c.json({ error: "unauthorized" }, 401);
  }
});
