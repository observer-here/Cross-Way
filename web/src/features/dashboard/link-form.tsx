import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function LinkForm() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Create Payment Link</h2>
        <span className="text-xs text-white/40">Preview</span>
      </div>
      <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Select Token">
            <Select defaultValue="USDC">
              <option value="USDC">USDC</option>
              <option value="EURC">EURC</option>
            </Select>
          </Field>
          <Field label="Amount">
            <div className="relative">
              <Input placeholder="25.00" defaultValue="25.00" className="pr-12" />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white/40">USD</span>
            </div>
          </Field>
        </div>
        <Field label="For">
          <Input placeholder="project payment, coffee..." />
        </Field>
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="accent-violet-500" />
            Set expiry
          </label>
          <Input type="date" defaultValue="2026-10-16" className="w-auto py-1.5" />
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-violet-500" />
            Allow specific user only
          </label>
        </div>
        <Submit>Generate Link →</Submit>
      </form>
    </section>
  );
}
