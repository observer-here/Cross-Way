import { createMiddleware } from "hono/factory";

import type { AppEnv } from "../env";
import { fail } from "../http/errors";
import { verifyAccessToken } from "../providers/privy";

export const requireUser = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) fail(401, "unauthorized");
  try {
    c.set("userId", await verifyAccessToken(c.env, token));
  } catch {
    fail(401, "unauthorized");
  }
  await next();
});
