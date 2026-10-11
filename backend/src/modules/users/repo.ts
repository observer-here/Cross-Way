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

  create(id: string, email: string, wallet: string, now: number) {
    return this.db
      .prepare("INSERT INTO users (id, email, username, user_id, wallet, created_at, updated_at) VALUES (?, ?, NULL, NULL, ?, ?, ?)")
      .bind(id, email, wallet, now, now)
      .run();
  }

  saveContact(id: string, email: string, wallet: string, now: number) {
    return this.db.prepare("UPDATE users SET email = ?, wallet = ?, updated_at = ? WHERE id = ?").bind(email, wallet, now, id).run();
  }

  saveProfile(id: string, username: string | null, userId: string | null, now: number) {
    return this.db.prepare("UPDATE users SET username = ?, user_id = ?, updated_at = ? WHERE id = ?").bind(username, userId, now, id).run();
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
