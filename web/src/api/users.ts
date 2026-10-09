import { request } from "./client";
import type { User } from "./types";

export function syncMe(token: string) {
  return request<User>("/v1/me", { method: "POST" }, token);
}

export function updateMe(token: string, body: { username?: string; userId?: string }) {
  return request<User>("/v1/me", { method: "PATCH", body: JSON.stringify(body) }, token);
}
