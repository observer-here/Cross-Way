import { Hono } from "hono";
import { cors } from "hono/cors";

import { config } from "./routes/config";
import { health } from "./routes/health";
import { lookup } from "./routes/lookup";
import { me } from "./routes/me";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) =>
  cors({
    origin: c.env.FRONTEND_ORIGIN || "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
  })(c, next),
);

app.route("/v1/health", health);
app.route("/v1/config", config);
app.route("/v1/lookup", lookup);
app.route("/v1/me", me);

export default app;
