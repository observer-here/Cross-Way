import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useSession } from "@/auth/session";
import { loadActivity } from "@/chain/read";
import { personLabel, shortAddress } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Input } from "@/shared/ui/field";

type Kind = "all" | "users" | "emails" | "addresses";

function kindOf(value: string): Exclude<Kind, "all"> {
  if (value.includes("@")) return "emails";
  if (/^0x[a-fA-F0-9]{40}$/i.test(value)) return "addresses";
  return "users";
}

export function ContactsPage() {
  const { wallet } = useSession();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Kind>("all");
  const [people, setPeople] = useState<string[]>([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!wallet) return;
    loadActivity(wallet)
      .then((rows) => {
        const seen = new Set<string>();
        const list: string[] = [];
        for (const row of rows) {
          const key = row.counterparty.toLowerCase();
          if (seen.has(key) || !row.counterparty) continue;
          seen.add(key);
          list.push(row.counterparty);
        }
        setPeople(list);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : "failed"));
  }, [wallet]);

  const shown = useMemo(() => {
    return people.filter((p) => {
      if (tab !== "all" && kindOf(p) !== tab) return false;
      return p.toLowerCase().includes(q.trim().toLowerCase());
    });
  }, [people, q, tab]);

  return (
    <section className="page">
      <h1 className="text-2xl font-semibold">Contacts</h1>
      <p className="mt-1 text-sm text-slate-500">People you have paid or been paid by.</p>
      <div className="panel mt-6 p-5">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username, email or address..." />
        <div className="mt-4 flex gap-2 text-xs">
          {(["all", "users", "emails", "addresses"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-3 py-1 capitalize ${tab === item ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              {item === "all" ? "All" : item}
            </button>
          ))}
        </div>
        {!wallet && <p className="mt-6 text-sm text-slate-400">Waiting for wallet…</p>}
        {err && <p className="mt-6 text-sm text-rose-500">{err}</p>}
        {wallet && !err && shown.length === 0 && <p className="mt-6 text-sm text-slate-400">No contacts yet.</p>}
        <ul className="mt-4 divide-y divide-slate-100">
          {shown.map((person) => (
            <li key={person} className="flex items-center gap-3 py-3">
              <Avatar name={person} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{personLabel(person)}</span>
                {/^0x/i.test(person) && <span className="font-mono text-[11px] text-slate-400">{shortAddress(person)}</span>}
              </span>
              <Link to={`/send?to=${encodeURIComponent(person)}`} className="text-sm text-indigo-500">
                Pay
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
