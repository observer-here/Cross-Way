import { Hono } from "hono";

import * as users from "../db/users";
import { getPrivyUser } from "../lib/privy";
import * as validate from "../lib/validate";
import { privyAuth } from "../middleware/auth";
import type { AppVars, Env } from "../types";

export const me = new Hono<{ Bindings: Env; Variables: AppVars }>()
  .use("*", privyAuth)
  .get("/", async (c) => {
    const row = await users.findById(c.env.DB, c.get("userId"));
    if (!row) return c.json({ error: "not found" }, 404);
    return c.json(row);
  })
  .post("/", async (c) => {
    const privy = await getPrivyUser(c.env, c.get("userId"));
    if (!privy) return c.json({ error: "privy user not found" }, 401);
    if (!privy.email) return c.json({ error: "email required" }, 400);
    if (!privy.wallet) return c.json({ error: "wallet required" }, 400);
    const now = Date.now();
    const existing = await users.findById(c.env.DB, privy.id);
    if (existing) {
      await users.updateContact(c.env.DB, privy.id, privy.email, privy.wallet, now);
      return c.json({ ...existing, email: privy.email, wallet: privy.wallet, updated_at: now });
    }
    try {
      await users.insert(c.env.DB, privy.id, privy.email, privy.wallet, now);
    } catch {
      return c.json({ error: "email or wallet taken" }, 409);
    }
    return c.json(
      { id: privy.id, email: privy.email, username: null, user_id: null, wallet: privy.wallet, created_at: now, updated_at: now },
      201,
    );
  })
  .patch("/", async (c) => {
    const body = await c.req.json<{ username?: string; userId?: string }>().catch(() => ({}));
    const nextName = body.username === undefined ? undefined : validate.username(body.username);
    const nextId = body.userId === undefined ? undefined : validate.userId(body.userId);
    if (nextName === "") return c.json({ error: "invalid username" }, 400);
    if (nextId === "") return c.json({ error: "invalid userId" }, 400);
    const row = await users.findById(c.env.DB, c.get("userId"));
    if (!row) return c.json({ error: "not found" }, 404);
    const now = Date.now();
    const username = nextName === undefined ? row.username : nextName;
    const userId = nextId === undefined ? row.user_id : nextId;
    try {
      await users.updateProfile(c.env.DB, row.id, username, userId, now);
    } catch {
      return c.json({ error: "username or userId taken" }, 409);
    }
    return c.json({ ...row, username, user_id: userId, updated_at: now });
  });
