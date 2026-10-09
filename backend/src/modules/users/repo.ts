import type { LookupQuery, User } from "./types";

export class UsersRepo {
  constructor(private db: D1Database) {}

  byId(id: string) {
    return this.db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
  }

  lookup(q: LookupQuery) {
    if (q.email) return this.db.prepare("SELECT * FROM users WHERE email = ?").bind(q.email).first<User>();
    if (q.username) return this.db.prepare("SELECT * FROM users WHERE username = ?").bind(q.username).first<User>();
    if (q.userId) return this.db.prepare("SELECT * FROM users WHERE user_id = ?").bind(q.userId).first<User>();
    if (q.wallet) return this.db.prepare("SELECT * FROM users WHERE wallet = ?").bind(q.wallet).first<User>();
    return Promise.resolve(null);
  }

  create(id: string, email: string, wallet: string, now: number) {
    return this.db
      .prepare(
        "INSERT INTO users (id, email, username, user_id, wallet, created_at, updated_at) VALUES (?, ?, NULL, NULL, ?, ?, ?)",
      )
      .bind(id, email, wallet, now, now)
      .run();
  }

  saveContact(id: string, email: string, wallet: string, now: number) {
    return this.db.prepare("UPDATE users SET email = ?, wallet = ?, updated_at = ? WHERE id = ?").bind(email, wallet, now, id).run();
  }

  saveProfile(id: string, username: string | null, userId: string | null, now: number) {
    return this.db
      .prepare("UPDATE users SET username = ?, user_id = ?, updated_at = ? WHERE id = ?")
      .bind(username, userId, now, id)
      .run();
  }
}
