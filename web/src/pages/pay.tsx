import { useParams } from "react-router-dom";

import { Submit } from "@/shared/ui/field";

export function PayPage() {
  const { id } = useParams();
  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Pay request</h1>
      <div className="panel mt-8 p-6">
        <p className="text-sm text-white/45">Invoice {id}</p>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-white/40">Amount</dt>
            <dd>25.00 USDC</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-white/40">Token</dt>
            <dd>USDC</dd>
          </div>
        </dl>
        <form className="mt-8" onSubmit={(e) => e.preventDefault()}>
          <Submit>Pay</Submit>
        </form>
      </div>
    </section>
  );
}
