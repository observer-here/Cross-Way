import { contacts } from "./data";

export function Contacts() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Contacts</h2>
        <span className="text-xs text-white/40">View All →</span>
      </div>
      <div className="mt-4 flex items-end gap-4 overflow-x-auto">
        {contacts.map((c) => (
          <div key={c.name} className="flex w-14 shrink-0 flex-col items-center gap-1">
            <span
              className="grid h-11 w-11 place-items-center rounded-full text-sm font-semibold"
              style={{ background: c.color }}
            >
              {c.name[0]}
            </span>
            <span className="truncate text-[11px] text-white/55">@{c.name}</span>
          </div>
        ))}
        <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-dashed border-white/20 text-lg text-white/50">
          +
        </button>
      </div>
    </section>
  );
}
