export async function scanGet<T>(base: string, path: string): Promise<T> {
  const origin = new URL(base).origin;
  const res = await fetch(`${base}${path}`, {
    headers: { accept: "application/json", origin, referer: `${origin}/` },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error("scan failed");
  return res.json() as Promise<T>;
}
