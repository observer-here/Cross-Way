import { Actions } from "@/features/dashboard/actions";
import { Balance } from "@/features/dashboard/balance";
import { Contacts } from "@/features/dashboard/contacts";
import { Hero } from "@/features/dashboard/hero";
import { LinkForm } from "@/features/dashboard/link-form";
import { PaymentLinks } from "@/features/dashboard/payment-links";
import { Receive } from "@/features/dashboard/receive";
import { Transactions } from "@/features/dashboard/transactions";

export function HomePage() {
  return (
    <div className="pb-10">
      <Hero />
      <Actions />
      <div className="mt-4 grid gap-4 px-6 md:grid-cols-[0.9fr_1.2fr_0.9fr] lg:px-8">
        <Balance />
        <Transactions />
        <LinkForm />
      </div>
      <div className="mt-4 grid gap-4 px-6 md:grid-cols-[1.1fr_1.2fr_0.9fr] lg:px-8">
        <Contacts />
        <PaymentLinks />
        <Receive />
      </div>
    </div>
  );
}
