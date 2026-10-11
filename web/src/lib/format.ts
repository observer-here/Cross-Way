import { parseUnits } from "viem";

export function shortAddress(value: string) {
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function isAmount(value: string) {
  return /^\d+(\.\d{1,6})?$/.test(value.trim()) && Number(value) > 0;
}

export function toTokenAmount(value: string, decimals = 6) {
  if (!isAmount(value)) throw new Error("Enter a valid amount");
  return parseUnits(value.trim(), decimals);
}

export function labelOf(username?: string | null, email?: string | null) {
  if (username) return `@${username}`;
  if (email) return email.split("@")[0];
  return "";
}

export function personLabel(value: string) {
  const v = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(v)) return shortAddress(v);
  if (v.includes("@") || v.startsWith("@")) return v;
  return `@${v}`;
}

export function feeParts(amount: string) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return { fee: "0.00", net: "0.00" };
  const fee = n * 0.005;
  const fmt = (v: number) => v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  return { fee: fmt(fee), net: fmt(n - fee) };
}

export function shortTime(ms: number) {
  if (!ms) return "";
  return new Date(ms).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
