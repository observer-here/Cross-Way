import type { LookupQuery, User } from "./types";

const COLS =
  "id, email, username, user_id, wallet, created_at, updated_at, CASE WHEN avatar IS NULL THEN 0 ELSE 1 END AS has_avatar";

type Row = Omit<User, "has_avatar"> & { has_avatar: number };

function map(row: Row): User {
  return { ...row, has_avatar: Boolean(row.has_avatar) };
}

export class UsersRepo {
  constructor(private db: D1Database) {}

  async byId(id: string) {
    const row = await this.db.prepare(`SELECT ${COLS} FROM users WHERE id = ?`).bind(id).first<Row>();
    return row ? map(row) : null;
  }

  async lookup(q: LookupQuery) {
    let row: Row | null = null;
    if (q.email) row = await this.db.prepare(`SELECT ${COLS} FROM users WHERE email = ?`).bind(q.email).first<Row>();
    else if (q.username) row = await this.db.prepare(`SELECT ${COLS} FROM users WHERE username = ?`).bind(q.username).first<Row>();
    else if (q.userId) row = await this.db.prepare(`SELECT ${COLS} FROM users WHERE user_id = ?`).bind(q.userId).first<Row>();
    else if (q.wallet) row = await this.db.prepare(`SELECT ${COLS} FROM users WHERE wallet = ?`).bind(q.wallet).first<Row>();
    return row ? map(row) : null;
  }

  async nextUsername() {
    await this.db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('username_n', 0)").run();
    const cur = await this.db.prepare("SELECT value FROM meta WHERE key = 'username_n'").first<{ value: number }>();
    if (!cur?.value) {
      const max = await this.db.prepare("SELECT MAX(CAST(substr(username, 9) AS INTEGER)) AS m FROM users WHERE username GLOB 'username[0-9]*'").first<{ m: number | null }>();
      if (max?.m) await this.db.prepare("UPDATE meta SET value = ? WHERE key = 'username_n'").bind(max.m).run();
    }
    const row = await this.db.prepare("UPDATE meta SET value = value + 1 WHERE key = 'username_n' RETURNING value").first<{ value: number }>();
    return `username${row?.value ?? 1}`;
  }

  create(id: string, email: string, wallet: string, username: string, userId: string, now: number) {
    return this.db
      .prepare("INSERT INTO users (id, email, username, user_id, wallet, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(id, email, username, userId, wallet, now, now)
      .run();
  }

  fillIdentity(id: string, username: string | null, userId: string | null, now: number) {
    return this.db
      .prepare("UPDATE users SET username = COALESCE(username, ?), user_id = COALESCE(user_id, ?), updated_at = ? WHERE id = ?")
      .bind(username, userId, now, id)
      .run();
  }

  saveUsername(id: string, username: string, now: number) {
    return this.db.prepare("UPDATE users SET username = ?, updated_at = ? WHERE id = ?").bind(username, now, id).run();
  }

  saveAvatar(id: string, bytes: ArrayBuffer, type: string, now: number) {
    return this.db.prepare("UPDATE users SET avatar = ?, avatar_type = ?, updated_at = ? WHERE id = ?").bind(new Uint8Array(bytes), type, now, id).run();
  }

  async avatar(id: string) {
    const row = await this.db.prepare("SELECT hex(avatar) AS hex, avatar_type FROM users WHERE id = ? AND avatar IS NOT NULL").bind(id).first<{ hex: string; avatar_type: string }>();
    if (!row?.hex) return null;
    const bytes = new Uint8Array(row.hex.length / 2);
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(row.hex.slice(i * 2, i * 2 + 2), 16);
    return { bytes, type: row.avatar_type };
  }
}
