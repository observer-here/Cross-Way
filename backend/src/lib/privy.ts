import type { Env } from "../types";

export async function getPrivyUser(env: Env, id: string) {
  const auth = btoa(`${env.PRIVY_APP_ID}:${env.PRIVY_APP_SECRET}`);
  const res = await fetch(`https://api.privy.io/v1/users/${id}`, {
    headers: { Authorization: `Basic ${auth}`, "privy-app-id": env.PRIVY_APP_ID },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    id: string;
    linked_accounts?: Array<{ type: string; address?: string; chain_type?: string }>;
  };
  const email = data.linked_accounts?.find((a) => a.type === "email")?.address?.toLowerCase() || "";
  const wallet =
    data.linked_accounts?.find((a) => a.type === "wallet" && (a.chain_type === "ethereum" || !a.chain_type))?.address?.toLowerCase() ||
    "";
  return { id: data.id, email, wallet };
}
