import { Activity } from "@/features/dashboard/activity";

export function HistoryPage() {
  return (
    <section className="page">
      <h1 className="mb-3 text-xl font-semibold lg:mb-6 lg:text-2xl">History</h1>
      <Activity title="All activity" all />
    </section>
  );
}
