export function username(v: string) {
  const s = v.trim().toLowerCase();
  return /^[a-z0-9_]{3,24}$/.test(s) ? s : "";
}

export function userId(v: string) {
  const s = v.trim();
  return /^[a-zA-Z0-9_-]{1,64}$/.test(s) ? s : "";
}
