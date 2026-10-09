import { LinkForm } from "@/features/dashboard/link-form";

export function LinksPage() {
  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Payment links</h1>
      <LinkForm />
    </section>
  );
}
