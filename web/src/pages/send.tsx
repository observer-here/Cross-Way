import { isAddress } from "viem";
import { useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { ARC } from "@/chain/arc";
import { useBalances } from "@/chain/balances";
import { useArcWallet } from "@/chain/wallet";
import { sendPayment } from "@/chain/write";
import { usePeople, type Person } from "@/features/send/people";
import { feeParts, personLabel, shortAddress } from "@/lib/format";
import { Avatar, PersonChip } from "@/shared/ui/avatar";
import { Field, Glow, Input, Select, Textarea } from "@/shared/ui/field";
import { GlassX, SideMark } from "@/shared/ui/mark";

export function SendPage() {
  const wallet = useArcWallet();
  const { data } = useBalances();
  const people = usePeople();
  const [params] = useSearchParams();
  const [to, setTo] = useState(params.get("to") ?? "");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDC");
  const [memo, setMemo] = useState("");
  const [step, setStep] = useState<"form" | "review" | "sent">("form");
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");
  const bal = token === "EURC" ? data?.eurc : data?.usdc;
  const who = people.find((p) => p.to.toLowerCase() === to.toLowerCase() || p.sub.toLowerCase() === to.toLowerCase());
  const label = who?.label ?? personLabel(to);
  const sub = who?.sub ?? (isAddress(to) ? to : to.includes("@") ? to : undefined);
  const fee = feeParts(amount);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    setStep("review");
  }

  async function send() {
    setStatus("Sending…");
    try {
      const tx = await sendPayment(wallet, to, amount, token, memo);
      setHash(tx);
      setStatus("");
      setStep("sent");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  function reset() {
    setTo("");
    setAmount("");
    setMemo("");
    setHash("");
    setStatus("");
    setStep("form");
  }

  if (step === "sent") {
    return (
      <div className="page flex flex-col items-center pt-4 lg:pt-8">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-500">
          <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="2.4">
            <path d="M5 12.5 9.5 17 19 7" />
          </svg>
        </span>
        <h1 className="mt-5 text-3xl font-semibold">Payment Sent!</h1>
        <p className="mt-2 text-sm text-slate-400">Your payment has been successfully sent.</p>
        <div className="panel mt-5 w-full max-w-xl p-4 lg:mt-8 lg:p-6">
          <div className="flex items-center gap-3">
            <Avatar name={label} src={who?.src} size="sm" />
            <div>
              <p className="text-xs text-slate-400">To</p>
              <p className="text-sm font-medium">{label}</p>
              {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
            </div>
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <Row label="Amount" value={`${amount} ${token}`} />
            <Row label="Network" value="Arc Testnet" />
            <Row label="Tx Hash" value={shortAddress(hash)} />
          </dl>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={`${ARC.explorer}/tx/${hash}`} className="rounded-full bg-white px-5 py-2.5 text-sm shadow-sm" target="_blank" rel="noreferrer">
            View on Explorer
          </a>
          <button type="button" onClick={reset} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white">
            Send Another Payment
          </button>
        </div>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="page grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section>
          <h1 className="text-xl font-semibold lg:text-2xl">Review & Send</h1>
          <p className="mt-1 text-sm text-slate-400">Please review the details before confirming this payment.</p>
          <div className="panel mt-3 p-4 lg:mt-6 lg:p-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <ReviewRow label="To" tone="bg-violet-50 text-violet-500" icon="M12 8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.5-4 14.5-4 16 0" onEdit={() => setStep("form")}>
                <span className="flex items-center gap-2">
                  <Avatar name={label} src={who?.src} size="xs" />
                  <span>
                    <span className="block text-sm font-medium">{label}</span>
                    {sub && <span className="block text-[11px] text-slate-400">{sub}</span>}
                  </span>
                </span>
              </ReviewRow>
              <ReviewRow label="Token" tone="bg-indigo-50 text-indigo-500" icon="M12 3c4 0 7 1.2 7 3s-3 3-7 3-7-1.2-7-3 3-3 7-3zm-7 5.5V12c0 1.8 3 3 7 3s7-1.2 7-3V8.5M5 12.5V16c0 1.8 3 3 7 3s7-1.2 7-3v-3.5" onEdit={() => setStep("form")} value={token} />
              <ReviewRow label="Amount" tone="bg-sky-50 text-sky-500" icon="M12 3v18M17 8c0-2-2.2-3.5-5-3.5S7 6 7 8s2 3 5 3 5 1.2 5 3-2.2 3.5-5 3.5S7 16 7 14" onEdit={() => setStep("form")} value={`${amount} ${token}`} />
              <ReviewRow label="Network" tone="bg-emerald-50 text-emerald-500" icon="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" value="Arc Testnet" sub="ERC-20" />
              {memo && <ReviewRow label="Message" tone="bg-orange-50 text-orange-400" icon="M5 5h14v10H8l-3 3V5z" onEdit={() => setStep("form")} value={memo} />}
            </dl>
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Amount</span>
                <span>
                  {amount} {token}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-slate-500">
                <span>Platform fee (0.5%)</span>
                <span>
                  {fee.fee} {token}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-slate-500">
                <span>Recipient gets</span>
                <span>
                  {fee.net} {token}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-slate-500">
                <span>Network fee (gas)</span>
                <span>USDC gas</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 font-semibold">
                <span>You pay</span>
                <span>
                  {amount} {token}
                </span>
              </div>
            </div>
            <Glow type="button" className="mt-6" onClick={send} disabled={!wallet.address}>
              {wallet.address ? `Send ${amount} ${token} →` : "Wallet loading…"}
            </Glow>
            {status && <p className="mt-4 text-sm text-slate-500">{status}</p>}
          </div>
        </section>
        <aside className="relative hidden min-h-[420px] lg:block">
          <GlassX className="absolute top-10 right-4" />
          <ul className="absolute bottom-8 left-0 space-y-4 text-sm">
            <li>
              <p className="font-semibold">Secure</p>
              <p className="text-slate-400">Your payment is encrypted and sent securely on-chain.</p>
            </li>
            <li>
              <p className="font-semibold">Fast</p>
              <p className="text-slate-400">Transactions are processed in seconds.</p>
            </li>
            <li>
              <p className="font-semibold">To Anyone</p>
              <p className="text-slate-400">Send using a username, email, EVM address or user ID.</p>
            </li>
          </ul>
        </aside>
      </div>
    );
  }

  return (
    <div className="page grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      <SideMark text="Send tokens to anyone. Anywhere." />
      <section>
        <h1 className="text-xl font-semibold lg:text-2xl">Send Payment</h1>
        <div className="mt-3 grid items-start gap-3 lg:mt-6 lg:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form className="panel flex flex-col gap-3 p-4 lg:gap-5 lg:p-8" onSubmit={onSubmit}>
          <Field label="To">
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="username, email, EVM address or user ID" required />
          </Field>
          {to && <PersonChip label={label} sub={sub} src={who?.src} onClear={() => setTo("")} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Token">
              <Select value={token} onChange={(e) => setToken(e.target.value)}>
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </Select>
            </Field>
            <Field label="Amount">
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0.00" required />
            </Field>
          </div>
          {bal && (
            <p className="text-right text-xs text-slate-400">
              Balance: {bal} {token}
            </p>
          )}
          {Number(amount) > 0 && (
            <p className="text-xs text-slate-400">
              Platform fee 0.5% ({fee.fee} {token}). Recipient gets {fee.net} {token}.
            </p>
          )}
          <Field label="Message (optional)">
            <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} maxLength={200} placeholder="For project payment, coffee..." />
          </Field>
          <p className="text-right text-[11px] text-slate-400">{memo.length}/200</p>
          <Glow disabled={!wallet.address}>{wallet.address ? "Review & Send →" : "Wallet loading…"}</Glow>
          </form>
          <aside className="panel p-3.5 lg:p-5">
            <p className="text-sm font-semibold">Recent</p>
            <ul className="mt-2">
              {people.length === 0 && <li className="py-10 text-center text-sm text-slate-400">No recent payments.</li>}
              {people.map((p) => (
                <li key={p.to}>
                  <PersonRow person={p} onPick={setTo} />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}

function PersonRow({ person, onPick }: { person: Person; onPick: (to: string) => void }) {
  return (
    <button type="button" onClick={() => onPick(person.to)} className="flex w-full items-center gap-3 py-2.5 text-left">
      <Avatar name={person.label} src={person.src} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{person.label}</span>
        {person.sub !== person.label && <span className="block truncate text-[11px] text-slate-400">{person.sub}</span>}
      </span>
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-indigo-400">
        <path d="M3 11.5 21 3l-7.5 18-2.4-6.6L3 11.5z" />
      </svg>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-400">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  sub,
  tone,
  icon,
  onEdit,
  children,
}: {
  label: string;
  value?: string;
  sub?: string;
  tone: string;
  icon: string;
  onEdit?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone}`}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <path d={icon} />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="mt-0.5">{children ?? value}</dd>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-xs text-indigo-400">
          Edit
        </button>
      )}
    </div>
  );
}
