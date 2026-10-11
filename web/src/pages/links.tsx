import { useState, type FormEvent } from "react";

import { waitInvoiceId } from "@/chain/read";
import { useArcWallet } from "@/chain/wallet";
import { createPaymentLink } from "@/chain/write";
import { DaysSelect, Field, Glow, Input, Textarea, TokenSelect } from "@/shared/ui/field";
import { SideMark, SoftIcon } from "@/shared/ui/mark";
import { QrCode } from "@/shared/ui/qr";

export function LinksPage() {
  const wallet = useArcWallet();
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDC");
  const [memo, setMemo] = useState("");
  const [days, setDays] = useState("7");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Creating…");
    try {
      const hash = await createPaymentLink(wallet, amount, token, memo, Number(days));
      setStatus("Indexing…");
      const id = await waitInvoiceId(hash);
      const url = id ? `${window.location.origin}/pay/${id}` : "";
      setLink(url);
      setDone(Boolean(url));
      setStatus(url || `Created. Tx ${hash.slice(0, 10)}…`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  async function copy() {
    if (link) await navigator.clipboard.writeText(link);
  }

  async function share() {
    if (!link) return;
    if (navigator.share) await navigator.share({ title: "CrossWay", text: link, url: link });
    else await copy();
  }

  if (done && link) {
    return (
      <div className="page">
        <h1 className="text-xl font-semibold lg:text-2xl">Payment Link Details</h1>
        <div className="mt-3 grid gap-3 lg:mt-6 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="panel p-4 lg:p-8">
            <div className="flex items-start gap-3">
              <SoftIcon className="bg-emerald-50 text-emerald-500">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
                </svg>
              </SoftIcon>
              <div className="min-w-0 flex-1">
                <p className="font-semibold break-words">{memo || "Payment Link"}</p>
                <p className="mt-1 truncate text-sm text-indigo-500">{link}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={copy} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs">
                    Copy Link
                  </button>
                  <button type="button" onClick={share} className="rounded-full bg-slate-50 px-3 py-1.5 text-xs">
                    Share
                  </button>
                </div>
              </div>
            </div>
            <dl className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Status</dt>
                <dd className="mt-1 text-emerald-500">Active</dd>
              </div>
              <div>
                <dt className="text-slate-400">Token</dt>
                <dd className="mt-1">{token}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Amount</dt>
                <dd className="mt-1">
                  {amount} {token}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Expiry</dt>
                <dd className="mt-1">{days} days</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setLink("");
                setStatus("");
              }}
              className="mt-8 text-sm text-slate-400"
            >
              Create another
            </button>
          </div>
          <div className="panel flex flex-col items-center p-4 lg:p-6">
            <QrCode value={link} size={176} className="p-2" />
            <p className="mt-4 text-sm font-medium">Scan to Pay</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      <SideMark text="Create a shareable link. Get paid from anyone.">
        <SoftIcon className="bg-emerald-50 text-emerald-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
          </svg>
        </SoftIcon>
      </SideMark>
      <section>
        <h1 className="text-xl font-semibold lg:text-2xl">Create Payment Link</h1>
        <p className="mt-1 text-sm text-slate-500">Generate a payment link to receive tokens.</p>
        <div className="mt-3 grid items-start gap-3 lg:mt-6 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <form className="panel flex flex-col gap-3 p-4 lg:gap-5 lg:p-8" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" required />
            </Field>
            <Field label="Token">
              <TokenSelect value={token} onChange={(e) => setToken(e.target.value)} />
            </Field>
          </div>
          <Field label="Message (optional)">
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={200} placeholder="For project, coffee..." />
          </Field>
          <p className="text-right text-[11px] text-slate-400">{memo.length}/200</p>
          <Field label="Expiry (optional)">
            <DaysSelect value={days} onChange={(e) => setDays(e.target.value)} />
          </Field>
          <Glow disabled={!wallet.address}>{wallet.address ? "Generate Link →" : "Wallet loading…"}</Glow>
          {status && <p className="text-sm break-all text-slate-500">{status}</p>}
        </form>
      <aside className="panel flex flex-col items-center p-3.5 lg:p-6">
        <p className="self-start text-sm font-semibold">Preview</p>
        <QrCode value={link} size={160} className="mt-6 p-2" />
        <p className="mt-4 max-w-full truncate text-xs text-slate-400">{link || "Preview after you generate"}</p>
      </aside>
        </div>
      </section>
    </div>
  );
}
