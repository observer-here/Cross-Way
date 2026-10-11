import { formatUnits, parseUnits } from "viem";

export function shortAddress(value: string) {
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function toTokenAmount(value: string, decimals = 6) {
  return parseUnits(value.trim() || "0", decimals);
}

export function fromTokenAmount(value: bigint, decimals = 6) {
  return formatUnits(value, decimals);
}

export function labelOf(email?: string | null, username?: string | null, wallet?: string) {
  if (username) return `@${username}`;
  if (email) return email.split("@")[0];
  if (wallet) return shortAddress(wallet);
  return "account";
}

export function personLabel(value: string) {
  const v = value.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(v)) return shortAddress(v);
  if (v.includes("@") || v.startsWith("@")) return v;
  return `@${v}`;
}

export function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function shortTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}
