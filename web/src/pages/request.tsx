import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function RequestPage() {
  return (
    <section className="max-w-md">
      <h1 className="text-xl font-semibold">Request</h1>
      <form className="mt-8 flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
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
          <Input name="memo" />
        </Field>
        <Submit>Create request</Submit>
      </form>
    </section>
  );
}
