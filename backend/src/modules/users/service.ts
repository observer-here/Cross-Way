import type { Env } from "../../env";
import { fail } from "../../http/errors";
import { fetchUser } from "../../providers/privy";
import { UsersRepo } from "./repo";
import type { LookupQuery, ProfilePatch, PublicUser, User } from "./types";

const USERNAME_RE = /^[a-z0-9_]{3,48}$/;
const AVATAR_MAX = 400_000;
const AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function toPublic(user: User): PublicUser {
  return {
    id: user.id,
    wallet: user.wallet,
    username: user.username,
    userId: user.user_id,
    email: user.email,
    has_avatar: user.has_avatar,
    updated_at: user.updated_at,
  };
}

function parseUsername(value: string) {
  const username = value.trim().toLowerCase().replace(/^@/, "");
  if (!USERNAME_RE.test(username)) fail(400, "invalid username");
  return username;
}

function randomUserId() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
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
    const raw = query.q?.trim();
    if (raw) {
      if (raw.includes("@")) query = { email: raw.toLowerCase() };
      else if (/^0x[a-fA-F0-9]{40}$/.test(raw)) query = { wallet: raw.toLowerCase() };
      else {
        const name = raw.replace(/^@/, "").toLowerCase();
        const byName = await this.repo.lookup({ username: name });
        if (byName) return toPublic(byName);
        const byId = await this.repo.lookup({ userId: raw.replace(/^@/, "") });
        if (byId) return toPublic(byId);
        fail(404, "not found");
      }
    }
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
    const existing = await this.repo.byId(privy.id);
    if (existing) {
      await this.ensureIdentity(existing);
      return this.getMe(privy.id);
    }
    const takenEmail = await this.repo.lookup({ email: privy.email });
    if (takenEmail) fail(409, "email taken");
    const takenWallet = await this.repo.lookup({ wallet: privy.wallet });
    if (takenWallet) fail(409, "wallet taken");
    try {
      await this.repo.create(privy.id, privy.email, privy.wallet, await this.freshUsername(), await this.freshUserId(), Date.now());
    } catch {
      fail(409, "email or wallet taken");
    }
    return this.getMe(privy.id);
  }

  async updateProfile(id: string, patch: ProfilePatch) {
    const user = await this.getMe(id);
    if (patch.username === undefined) return user;
    const username = parseUsername(patch.username);
    try {
      await this.repo.saveUsername(id, username, Date.now());
    } catch {
      fail(409, "username taken");
    }
    return this.getMe(id);
  }

  async updateAvatar(id: string, bytes: ArrayBuffer, type: string) {
    await this.getMe(id);
    const mime = type.split(";")[0]?.trim().toLowerCase() ?? "";
    if (!AVATAR_TYPES.has(mime)) fail(400, "image must be jpeg, png, or webp");
    if (bytes.byteLength < 32 || bytes.byteLength > AVATAR_MAX) fail(400, "image too large");
    await this.repo.saveAvatar(id, bytes, mime, Date.now());
    return this.getMe(id);
  }

  avatar(id: string) {
    return this.repo.avatar(id);
  }

  private async ensureIdentity(user: User) {
    if (user.username && user.user_id) return;
    await this.repo.fillIdentity(user.id, user.username ?? (await this.freshUsername()), user.user_id ?? (await this.freshUserId()), Date.now());
  }

  private async freshUsername() {
    for (let i = 0; i < 16; i++) {
      const username = await this.repo.nextUsername();
      if (!(await this.repo.lookup({ username }))) return username;
    }
    fail(500, "username failed");
  }

  private async freshUserId() {
    for (let i = 0; i < 16; i++) {
      const userId = randomUserId();
      if (!(await this.repo.lookup({ userId }))) return userId;
    }
    fail(500, "user id failed");
  }
}
