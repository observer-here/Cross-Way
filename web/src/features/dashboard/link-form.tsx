import { useState, type FormEvent } from "react";

import { useArcWallet } from "@/chain/wallet";
import { createPaymentLink } from "@/chain/write";
import { Input, Select, Submit } from "@/shared/ui/field";

export function LinkForm() {
  const wallet = useArcWallet();
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = String(fd.get("amount") ?? "");
    const symbol = String(fd.get("token") ?? "USDC");
    const memo = String(fd.get("memo") ?? "");
    setStatus("Creating…");
    try {
      const hash = await createPaymentLink(wallet, amount, symbol, memo);
      setStatus(`Created. Tx ${hash.slice(0, 10)}…`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold">Create Payment Link</h2>
      <form className="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
        <Select name="token" defaultValue="USDC">
          <option value="USDC">USDC</option>
          <option value="EURC">EURC</option>
        </Select>
        <Input name="amount" placeholder="0.00" inputMode="decimal" required />
        <Input name="memo" placeholder="For project payment, coffee..." maxLength={200} />
        <Submit disabled={!wallet.address}>{wallet.address ? "Generate Link →" : "Wallet loading…"}</Submit>
        {status && <p className="text-xs text-slate-500">{status}</p>}
      </form>
    </section>
  );
}
