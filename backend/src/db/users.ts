import type { User } from "../types";

export function findById(db: D1Database, id: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}

export function findByEmail(db: D1Database, email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").bind(email).first<User>();
}

export function findByUsername(db: D1Database, username: string) {
  return db.prepare("SELECT * FROM users WHERE username = ?").bind(username).first<User>();
}

export function findByUserId(db: D1Database, userId: string) {
  return db.prepare("SELECT * FROM users WHERE user_id = ?").bind(userId).first<User>();
}

export function findByWallet(db: D1Database, wallet: string) {
  return db.prepare("SELECT * FROM users WHERE wallet = ?").bind(wallet).first<User>();
}

export function insert(db: D1Database, id: string, email: string, wallet: string, now: number) {
  return db
    .prepare("INSERT INTO users (id, email, username, user_id, wallet, created_at, updated_at) VALUES (?, ?, NULL, NULL, ?, ?, ?)")
    .bind(id, email, wallet, now, now)
    .run();
}

export function updateContact(db: D1Database, id: string, email: string, wallet: string, now: number) {
  return db.prepare("UPDATE users SET email = ?, wallet = ?, updated_at = ? WHERE id = ?").bind(email, wallet, now, id).run();
}

export function updateProfile(db: D1Database, id: string, username: string | null, userId: string | null, now: number) {
  return db.prepare("UPDATE users SET username = ?, user_id = ?, updated_at = ? WHERE id = ?").bind(username, userId, now, id).run();
}
