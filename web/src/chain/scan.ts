const SCAN = "https://explorer.testnet.arc.io/api/v2";

export async function scanGet<T>(path: string): Promise<T> {
  const res = await fetch(`${SCAN}${path}`);
  if (!res.ok) throw new Error("Arc Scan request failed");
  return res.json() as Promise<T>;
}
