import { Hono } from "hono";

import type { AppEnv } from "../../env";
import { fail } from "../../http/errors";
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
  .get("/avatars/:id", async (c) => {
    const row = await new UsersService(c.env).avatar(c.req.param("id"));
    if (!row?.avatar) fail(404, "not found");
    return new Response(row.avatar, {
      headers: {
        "Content-Type": row.avatar_type || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
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
  })
  .put("/me/avatar", requireUser, async (c) => {
    const type = c.req.header("content-type") ?? "";
    const bytes = await c.req.arrayBuffer();
    return c.json(await new UsersService(c.env).updateAvatar(c.get("userId"), bytes, type));
  });
