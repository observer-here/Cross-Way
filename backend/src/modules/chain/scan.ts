const SCAN = "https://explorer.testnet.arc.io/api/v2";

export async function scanGet<T>(path: string, ttl = 12): Promise<T> {
  const url = `${SCAN}${path}`;
  const cache = await caches.open("arc-scan");
  if (ttl > 0) {
    const hit = await cache.match(url);
    if (hit) return hit.json() as Promise<T>;
  }
  const res = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    ...(ttl > 0 ? { cf: { cacheEverything: true, cacheTtl: ttl } } : {}),
  });
  if (!res.ok) throw new Error("scan failed");
  const data = (await res.json()) as T;
  if (ttl > 0) {
    await cache.put(
      url,
      new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttl}` },
      }),
    );
  }
  return data;
}
