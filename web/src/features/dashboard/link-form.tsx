import { Field, Input, Select, Submit } from "@/shared/ui/field";

export function LinkForm() {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold">Create Payment Link</h2>
      <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <Select defaultValue="USDC" className="pl-9">
            <option value="USDC">USDC</option>
            <option value="EURC">EURC</option>
          </Select>
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sky-500">$</span>
        </div>
        <div className="relative">
          <Input placeholder="25.00" defaultValue="25.00" className="pr-12" />
          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">USD</span>
        </div>
        <div className="relative">
          <Input placeholder="For project payment, coffee..." maxLength={200} />
          <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-300">0/200</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" defaultChecked className="accent-slate-900" />
          Set expiry
          <Input type="date" defaultValue="2026-10-16" className="ml-auto w-auto py-1.5" />
        </label>
        <Submit>Generate Link →</Submit>
      </form>
    </section>
  );
}
