import { useEffect, useState } from "react";

import { avatarSrc, lookup } from "@/api/users";
import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { loadActivity } from "@/chain/read";
import { personLabel, shortAddress } from "@/lib/format";

export type Person = {
  to: string;
  label: string;
  sub: string;
  src?: string;
};

async function enrich(addr: string): Promise<Person> {
  const found = await lookup({ wallet: addr }).catch(() => null);
  if (!found) return { to: addr, label: personLabel(addr), sub: shortAddress(addr) };
  const to = found.username || found.email || found.userId || addr;
  const label = found.username ? `@${found.username}` : found.email || personLabel(addr);
  return { to, label, sub: found.email && found.username ? found.email : shortAddress(found.wallet), src: avatarSrc(found) };
}

export function usePeople() {
  const { wallet } = useSession();
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (!wallet) return;
    let alive = true;
    (async () => {
      const rows = await loadActivity(wallet).catch(() => []);
      const addrs: string[] = [];
      const seen = new Set<string>();
      const me = wallet.toLowerCase();
      const contract = ARC.contract.toLowerCase();
      for (const row of rows) {
        const a = row.counterparty;
        const key = a.toLowerCase();
        if (!a || seen.has(key) || key === me || key === contract) continue;
        seen.add(key);
        addrs.push(a);
        if (addrs.length >= 12) break;
      }
      const list = await Promise.all(addrs.map(enrich));
      if (alive) setPeople(list);
    })();
    return () => {
      alive = false;
    };
  }, [wallet]);

  return people;
}
