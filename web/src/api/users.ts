import { request } from "./client";
import type { LookupQuery, PublicUser, User } from "./types";

export function lookup(query: LookupQuery) {
  const params = new URLSearchParams();
  if (query.email) params.set("email", query.email);
  if (query.username) params.set("username", query.username);
  if (query.userId) params.set("userId", query.userId);
  if (query.wallet) params.set("wallet", query.wallet);
  return request<PublicUser>(`/v1/lookup?${params}`);
}

export function getMe(token: string) {
  return request<User>("/v1/me", { method: "GET" }, token);
}

export function syncMe(token: string) {
  return request<User>("/v1/me", { method: "POST" }, token);
}

export function updateMe(token: string, body: { username?: string; userId?: string }) {
  return request<User>("/v1/me", { method: "PATCH", body: JSON.stringify(body) }, token);
}
