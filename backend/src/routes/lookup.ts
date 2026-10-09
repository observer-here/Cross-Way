import { Hono } from "hono";

import * as users from "../db/users";
import type { Env } from "../types";

export const lookup = new Hono<{ Bindings: Env }>().get("/", async (c) => {
  const email = c.req.query("email")?.trim().toLowerCase();
  const username = c.req.query("username")?.trim().toLowerCase();
  const userId = c.req.query("userId")?.trim();
  const wallet = c.req.query("wallet")?.trim().toLowerCase();
  const row = email
    ? await users.findByEmail(c.env.DB, email)
    : username
      ? await users.findByUsername(c.env.DB, username)
      : userId
        ? await users.findByUserId(c.env.DB, userId)
        : wallet
          ? await users.findByWallet(c.env.DB, wallet)
          : null;
  if (!email && !username && !userId && !wallet) return c.json({ error: "missing query" }, 400);
  if (!row) return c.json({ error: "not found" }, 404);
  return c.json({ wallet: row.wallet, username: row.username, userId: row.user_id });
});
