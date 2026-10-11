import { Activity } from "@/features/dashboard/activity";

export function HistoryPage() {
  return (
    <section className="page">
      <h1 className="mb-6 text-2xl font-semibold">History</h1>
      <Activity title="All activity" all />
    </section>
  );
}
