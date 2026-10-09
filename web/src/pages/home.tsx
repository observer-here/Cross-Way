import { Actions } from "@/features/dashboard/actions";
import { Activity } from "@/features/dashboard/activity";
import { Balance } from "@/features/dashboard/balance";
import { Hero } from "@/features/dashboard/hero";
import { LinkForm } from "@/features/dashboard/link-form";

export function HomePage() {
  return (
    <div className="pb-10">
      <Hero />
      <Actions />
      <div className="mt-4 grid gap-4 px-6 md:grid-cols-[0.9fr_1.2fr_0.9fr] lg:px-16">
        <Balance />
        <Activity />
        <LinkForm />
      </div>
    </div>
  );
}
