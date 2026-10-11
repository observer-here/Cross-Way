import { env } from "@/config/env";

import { ApiError, request } from "./client";
import type { PublicUser, User } from "./types";

export function avatarSrc(user?: Pick<User, "id" | "has_avatar" | "updated_at"> | null) {
  if (!user?.has_avatar) return undefined;
  return `${env.apiUrl}/v1/avatars/${encodeURIComponent(user.id)}?v=${user.updated_at}`;
}

export function lookup(query: { q?: string; email?: string; username?: string; userId?: string; wallet?: string }) {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.email) params.set("email", query.email);
  if (query.username) params.set("username", query.username);
  if (query.userId) params.set("userId", query.userId);
  if (query.wallet) params.set("wallet", query.wallet);
  return request<PublicUser>(`/v1/lookup?${params}`);
}

export function syncMe(token: string) {
  return request<User>("/v1/me", { method: "POST" }, token);
}

export function updateMe(token: string, body: { username?: string; userId?: string }) {
  return request<User>("/v1/me", { method: "PATCH", body: JSON.stringify(body) }, token);
}

export async function uploadAvatar(token: string, file: Blob) {
  const res = await fetch(`${env.apiUrl}/v1/me/avatar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": file.type || "image/jpeg" },
    body: file,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<User>;
}

export function toAvatarJpeg(file: File) {
  return new Promise<Blob>((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("encode"));
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}
