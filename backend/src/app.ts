import { Hono } from "hono";
import { cors } from "hono/cors";

import type { AppEnv } from "./env";
import { HttpError } from "./http/errors";
import { chainRoutes } from "./modules/chain/routes";
import { userRoutes } from "./modules/users/routes";

const app = new Hono<AppEnv>();

app.use("*", (c, next) =>
  cors({
    origin: c.env.FRONTEND_ORIGIN || "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
  })(c, next),
);

app.onError((err, c) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof HttpError ? err.message : "internal";
  return c.body(JSON.stringify({ error: message }), status, { "Content-Type": "application/json" });
});

app.route("/v1", chainRoutes);
app.route("/v1", userRoutes);

export default app;
