import { useParams } from "react-router-dom";

import { Submit } from "@/shared/ui/field";

export function PayPage() {
  const { id } = useParams();
  return (
    <section className="max-w-md">
      <h1 className="text-xl font-semibold">Pay request</h1>
      <p className="mt-2 text-sm text-zinc-500">Invoice {id}</p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-zinc-500">Amount</dt>
          <dd>—</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Token</dt>
          <dd>—</dd>
        </div>
        <div>
          <dt className="text-zinc-500">To</dt>
          <dd>—</dd>
        </div>
      </dl>
      <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
        <Submit>Pay</Submit>
      </form>
    </section>
  );
}
