import type { Env } from "../../env";
import { fail } from "../../http/errors";
import { fetchUser } from "../../providers/privy";
import { UsersRepo } from "./repo";
import type { LookupQuery, ProfilePatch, PublicUser, User } from "./types";

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;
const USER_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

function toPublic(user: User): PublicUser {
  return { wallet: user.wallet, username: user.username, userId: user.user_id };
}

function parseUsername(value: string) {
  const username = value.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) fail(400, "invalid username");
  return username;
}

function parseUserId(value: string) {
  const userId = value.trim();
  if (!USER_ID_RE.test(userId)) fail(400, "invalid userId");
  return userId;
}

export class UsersService {
  constructor(
    private env: Env,
    private repo = new UsersRepo(env.DB),
  ) {}

  async getMe(id: string) {
    const user = await this.repo.byId(id);
    if (!user) fail(404, "not found");
    return user;
  }

  async lookup(query: LookupQuery) {
    const q: LookupQuery = {
      email: query.email?.trim().toLowerCase(),
      username: query.username?.trim().toLowerCase(),
      userId: query.userId?.trim(),
      wallet: query.wallet?.trim().toLowerCase(),
    };
    if (!q.email && !q.username && !q.userId && !q.wallet) fail(400, "missing query");
    const user = await this.repo.lookup(q);
    if (!user) fail(404, "not found");
    return toPublic(user);
  }

  async sync(id: string) {
    const privy = await fetchUser(this.env, id);
    if (!privy) fail(401, "privy user not found");
    if (!privy.email) fail(400, "email required");
    if (!privy.wallet) fail(400, "wallet required");
    const now = Date.now();
    const existing = await this.repo.byId(privy.id);
    if (existing) {
      await this.repo.saveContact(privy.id, privy.email, privy.wallet, now);
      return { ...existing, email: privy.email, wallet: privy.wallet, updated_at: now };
    }
    try {
      await this.repo.create(privy.id, privy.email, privy.wallet, now);
    } catch {
      fail(409, "email or wallet taken");
    }
    return {
      id: privy.id,
      email: privy.email,
      username: null,
      user_id: null,
      wallet: privy.wallet,
      created_at: now,
      updated_at: now,
    };
  }

  async updateProfile(id: string, patch: ProfilePatch) {
    const user = await this.getMe(id);
    const username = patch.username === undefined ? user.username : parseUsername(patch.username);
    const userId = patch.userId === undefined ? user.user_id : parseUserId(patch.userId);
    const now = Date.now();
    try {
      await this.repo.saveProfile(id, username, userId, now);
    } catch {
      fail(409, "username or userId taken");
    }
    return { ...user, username, user_id: userId, updated_at: now };
  }
}
