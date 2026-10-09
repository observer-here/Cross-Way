import { links } from "./data";

export function PaymentLinks() {
  return (
    <section className="panel p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Your Payment Links</h2>
        <span className="text-xs text-white/40">View All →</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {links.map((link) => (
          <div key={link.title} className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className={`inline-block rounded-lg bg-linear-to-br ${link.color} px-2 py-1 text-[10px]`}>↗</span>
            <p className="mt-2 text-sm font-medium">{link.title}</p>
            <p className="text-xs text-white/45">
              {link.amount} · {link.count}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
