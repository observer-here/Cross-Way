import { Hono } from "hono";

import type { Env } from "../types";

export const health = new Hono<{ Bindings: Env }>().get("/", (c) => c.json({ ok: true }));
