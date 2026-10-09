import { Activity } from "@/features/dashboard/activity";

export function HistoryPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">History</h1>
      <Activity />
    </section>
  );
}
