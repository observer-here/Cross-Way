const FALLBACK = "https://explorer.testnet.arc.io/api/v2";

export async function scanGet<T>(base: string | undefined, path: string): Promise<T> {
  const res = await fetch(`${base || FALLBACK}${path}`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("scan failed");
  return res.json() as Promise<T>;
}
