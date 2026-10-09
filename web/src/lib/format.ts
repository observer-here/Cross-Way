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
