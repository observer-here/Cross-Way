import { createRemoteJWKSet, jwtVerify } from "jose";

import type { Env } from "../env";

type LinkedAccount = { type: string; address?: string; chain_type?: string };

const jwksByApp = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function jwks(appId: string) {
  let set = jwksByApp.get(appId);
  if (!set) {
    set = createRemoteJWKSet(new URL(`https://auth.privy.io/v1/apps/${appId}/jwks.json`));
    jwksByApp.set(appId, set);
  }
  return set;
}

export async function verifyAccessToken(env: Env, token: string) {
  const { payload } = await jwtVerify(token, jwks(env.PRIVY_APP_ID), {
    issuer: "privy.io",
    audience: env.PRIVY_APP_ID,
  });
  const sub = String(payload.sub ?? "");
  if (!sub) throw new Error("missing sub");
  return sub;
}

export async function fetchUser(env: Env, id: string) {
  const res = await fetch(`https://api.privy.io/v1/users/${id}`, {
    headers: {
      Authorization: `Basic ${btoa(`${env.PRIVY_APP_ID}:${env.PRIVY_APP_SECRET}`)}`,
      "privy-app-id": env.PRIVY_APP_ID,
    },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { id: string; linked_accounts?: LinkedAccount[] };
  const accounts = data.linked_accounts ?? [];
  const email = accounts.find((a) => a.type === "email")?.address?.toLowerCase() ?? "";
  const wallet =
    accounts.find((a) => a.type === "wallet" && (!a.chain_type || a.chain_type === "ethereum"))?.address?.toLowerCase() ?? "";
  return { id: data.id, email, wallet };
}
