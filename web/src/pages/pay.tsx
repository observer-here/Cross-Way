import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { useSession } from "@/auth/session";
import { loadInvoice } from "@/chain/read";
import { cancelInvoice, payInvoice } from "@/chain/write";
import { useArcWallet } from "@/chain/wallet";
import { personLabel, shortAddress } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Submit } from "@/shared/ui/field";

export function PayPage() {
  const { id } = useParams();
  const signer = useArcWallet();
  if (id === "scan") return <Navigate to="/scan" replace />;
  if (!id || !/^\d+$/.test(id)) return <p className="page text-sm text-slate-500">Invalid invoice.</p>;
  return <InvoicePay id={BigInt(id)} signer={signer} />;
}

function InvoicePay({ id, signer }: { id: bigint; signer: ReturnType<typeof useArcWallet> }) {
  const { wallet } = useSession();
  const [inv, setInv] = useState<Awaited<ReturnType<typeof loadInvoice>>>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadInvoice(id)
      .then(setInv)
      .catch((e) => setStatus(e instanceof Error ? e.message : "failed"));
  }, [id]);

  if (!inv && !status) return <p className="page text-sm text-slate-500">Loading invoice…</p>;
  if (!inv) return <p className="page text-sm text-slate-500">{status || "Invoice not found."}</p>;
  const invoice = inv;
  const mine = wallet && wallet.toLowerCase() === invoice.payee.toLowerCase();

  async function pay() {
    setStatus("Paying…");
    try {
      await payInvoice(signer, id, invoice.tokenAddress, invoice.rawAmount);
      setInv({ ...invoice, closed: true });
      setStatus("Paid.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "failed");
    }
  }

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold">Complete Payment</h1>
      <p className="mt-1 text-sm text-slate-500">Review the details and confirm.</p>
      <div className="panel mt-6 grid gap-8 p-6 lg:grid-cols-2 lg:p-10">
        <div>
          <div className="flex items-center gap-3">
            <Avatar name={invoice.payee} size="lg" />
            <div>
              <p className="font-medium">{personLabel(invoice.payee)}</p>
              <p className="text-sm text-slate-400">{invoice.closed ? "This invoice is closed" : "is requesting a payment"}</p>
            </div>
          </div>
          <p className="mt-8 text-4xl font-semibold">
            {invoice.amount} {invoice.token}
          </p>
          {invoice.memo && <p className="mt-2 text-sm text-slate-400">{invoice.memo}</p>}
          <div className="mt-5 flex gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{invoice.token}</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-500">Arc Testnet</span>
          </div>
        </div>
        <div>
          <dl className="space-y-4 text-sm">
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
              <dt className="text-slate-400">Network</dt>
              <dd>Arc Testnet</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Status</dt>
              <dd>{invoice.closed ? "Closed" : "Open"}</dd>
            </div>
          </dl>
          {!invoice.closed && (
            <div className="mt-8">
              <Submit type="button" onClick={pay} disabled={!signer.address}>
                {signer.address ? "Pay Now →" : "Connect Wallet to Pay"}
              </Submit>
              {mine && (
                <button
                  type="button"
                  className="mt-4 text-sm text-slate-400"
                  onClick={async () => {
                    setStatus("Cancelling…");
                    try {
                      await cancelInvoice(signer, id);
                      setInv({ ...invoice, closed: true });
                      setStatus("Cancelled.");
                    } catch (e) {
                      setStatus(e instanceof Error ? e.message : "failed");
                    }
                  }}
                >
                  Cancel invoice
                </button>
              )}
            </div>
          )}
          {status && <p className="mt-4 text-sm text-slate-500">{status}</p>}
        </div>
      </div>
    </div>
  );
}
