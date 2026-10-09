import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { loadInvoice } from "@/chain/read";
import { payInvoice } from "@/chain/write";
import { useArcWallet } from "@/chain/wallet";
import { shortAddress } from "@/lib/format";
import { Submit } from "@/shared/ui/field";

export function PayPage() {
  const { id } = useParams();
  const { wallet } = useSession();
  const signer = useArcWallet();

  if (id === "scan") return <Receive wallet={wallet} />;
  if (!id || !/^\d+$/.test(id)) return <p className="px-6 py-10 text-sm text-slate-500">Invalid invoice.</p>;
  return <InvoicePay id={BigInt(id)} signer={signer} />;
}

function Receive({ wallet }: { wallet?: string }) {
  if (!wallet) return <p className="px-6 py-10 text-sm text-slate-500">Waiting for wallet…</p>;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${wallet}`;
  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Receive</h1>
      <div className="panel mt-8 flex flex-col items-center gap-4 p-6">
        <img src={src} alt="Receive QR" className="h-40 w-40 rounded-xl bg-white p-2" />
        <p className="font-mono text-sm">{shortAddress(wallet)}</p>
        <a href={`${ARC.explorer}/address/${wallet}`} className="text-xs text-indigo-500" target="_blank" rel="noreferrer">
          {wallet}
        </a>
      </div>
    </section>
  );
}

function InvoicePay({ id, signer }: { id: bigint; signer: ReturnType<typeof useArcWallet> }) {
  const [inv, setInv] = useState<Awaited<ReturnType<typeof loadInvoice>>>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadInvoice(id)
      .then(setInv)
      .catch((e) => setStatus(e instanceof Error ? e.message : "failed"));
  }, [id]);

  if (!inv && !status) return <p className="px-6 py-10 text-sm text-slate-500">Loading invoice…</p>;
  if (!inv) return <p className="px-6 py-10 text-sm text-slate-500">{status || "Invoice not found."}</p>;
  const invoice = inv;

  async function pay() {
    setStatus("Paying…");
    try {
      await payInvoice(signer, id, invoice.tokenAddress, invoice.rawAmount);
      setStatus("Paid.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "failed");
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Pay</h1>
      <div className="panel mt-8 p-6">
        <p className="text-sm text-slate-400">Invoice {id.toString()}</p>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-400">To</dt>
            <dd>{shortAddress(invoice.payee)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Amount</dt>
            <dd>
              {invoice.amount} {invoice.token}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-400">Status</dt>
            <dd>{invoice.closed ? "Closed" : "Open"}</dd>
          </div>
        </dl>
        {!invoice.closed && (
          <div className="mt-8">
            <Submit type="button" onClick={pay} disabled={!signer.address}>
              Pay →
            </Submit>
          </div>
        )}
        {status && <p className="mt-4 text-sm text-slate-500">{status}</p>}
      </div>
    </section>
  );
}
