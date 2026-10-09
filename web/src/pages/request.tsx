import { useState, type FormEvent } from "react";

import { waitInvoiceId } from "@/chain/read";
import { useArcWallet } from "@/chain/wallet";
import { createPaymentRequest } from "@/chain/write";
import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function RequestPage() {
  const wallet = useArcWallet();
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("Creating…");
    try {
      const hash = await createPaymentRequest(
        wallet,
        String(fd.get("from") ?? ""),
        String(fd.get("amount")),
        String(fd.get("token") ?? "USDC"),
        String(fd.get("memo") ?? ""),
      );
      setStatus("Indexing…");
      const id = await waitInvoiceId(hash);
      setStatus(id ? `Pay link: ${window.location.origin}/pay/${id}` : `Created. Tx ${hash.slice(0, 10)}…`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Request</h1>
      <p className="mt-1 text-sm text-slate-500">Ask for tokens, or leave From blank to make a link.</p>
      <form className="panel mt-8 flex flex-col gap-5 p-6" onSubmit={onSubmit}>
        <Field label="From">
          <Input name="from" placeholder="wallet, username, or blank for a link" />
        </Field>
        <Field label="Amount">
          <Input name="amount" inputMode="decimal" placeholder="0.00" required />
        </Field>
        <Field label="Token">
          <Select name="token" defaultValue="USDC">
            <option value="USDC">USDC</option>
            <option value="EURC">EURC</option>
          </Select>
        </Field>
        <Field label="Memo">
          <Input name="memo" placeholder="optional" />
        </Field>
        <Submit disabled={!wallet.address}>{wallet.address ? "Create request →" : "Wallet loading…"}</Submit>
        {status && <p className="text-sm text-slate-500">{status}</p>}
      </form>
    </section>
  );
}
