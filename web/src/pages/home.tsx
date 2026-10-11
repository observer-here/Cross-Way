import { Actions } from "@/features/dashboard/actions";
import { Activity } from "@/features/dashboard/activity";
import { Balance } from "@/features/dashboard/balance";
import { useSession } from "@/auth/session";
import { labelOf } from "@/lib/format";

export function HomePage() {
  const { me, wallet } = useSession();
  const name = labelOf(me?.email, me?.username, wallet).replace(/^@/, "");

  return (
    <div className="page">
      <p className="italic text-slate-400">Welcome Back,</p>
      <h1 className="mt-1 text-5xl font-semibold tracking-tight">{name}</h1>
      <p className="mt-2 text-sm text-slate-400">Send, receive and manage your payments on Arc Testnet.</p>
      <div className="mt-8">
        <Actions />
      </div>
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Balance />
        <Activity />
      </div>
    </div>
  );
}
