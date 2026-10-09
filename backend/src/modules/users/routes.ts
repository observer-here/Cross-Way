import { Hono } from "hono";

import type { AppEnv } from "../../env";
import { requireUser } from "../../middleware/auth";
import { UsersService } from "./service";
import type { ProfilePatch } from "./types";

export const userRoutes = new Hono<AppEnv>()
  .get("/lookup", async (c) => {
    const data = await new UsersService(c.env).lookup({
      email: c.req.query("email"),
      username: c.req.query("username"),
      userId: c.req.query("userId"),
      wallet: c.req.query("wallet"),
    });
    return c.json(data);
  })
  .get("/me", requireUser, async (c) => {
    return c.json(await new UsersService(c.env).getMe(c.get("userId")));
  })
  .post("/me", requireUser, async (c) => {
    return c.json(await new UsersService(c.env).sync(c.get("userId")));
  })
  .patch("/me", requireUser, async (c) => {
    const body = await c.req.json<ProfilePatch>().catch(() => ({}));
    return c.json(await new UsersService(c.env).updateProfile(c.get("userId"), body));
  });
