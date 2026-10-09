import { useState, type FormEvent } from "react";

import { useArcWallet } from "@/chain/wallet";
import { sendPayment } from "@/chain/write";
import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function SendPage() {
  const wallet = useArcWallet();
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("Sending…");
    try {
      await sendPayment(
        wallet,
        String(fd.get("to")),
        String(fd.get("amount")),
        String(fd.get("token") ?? "USDC"),
        String(fd.get("memo") ?? ""),
      );
      setStatus("Sent.");
      e.currentTarget.reset();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Send</h1>
      <p className="mt-1 text-sm text-slate-500">Pay anyone by username, email, user ID, or address.</p>
      <form className="panel mt-8 flex flex-col gap-5 p-6" onSubmit={onSubmit}>
        <Field label="To">
          <Input name="to" placeholder="username, email, user id, or 0x address" required />
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
        <Submit disabled={!wallet.address}>{wallet.address ? "Send Payment →" : "Wallet loading…"}</Submit>
        {status && <p className="text-sm text-slate-500">{status}</p>}
      </form>
    </section>
  );
}
