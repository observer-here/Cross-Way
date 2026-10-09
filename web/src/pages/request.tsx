import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function RequestPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Request</h1>
      <p className="mt-1 text-sm text-slate-500">Ask for tokens or create a shareable payment link.</p>
      <form className="panel mt-8 flex flex-col gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
        <Field label="From">
          <Input name="from" placeholder="wallet, username, or leave blank for a link" />
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
        <Submit>Create request →</Submit>
      </form>
    </section>
  );
}
