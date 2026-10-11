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
      <p className="text-[22px] font-normal text-slate-400 italic">Welcome back,</p>
      <h1 className="mt-1 text-5xl font-extrabold tracking-tight text-slate-950 sm:text-[56px] sm:leading-none">{name}</h1>
      <p className="mt-3 text-sm text-slate-500">Send, receive and manage your payments on Arc Testnet.</p>
      <div className="mt-8">
        <Actions />
      </div>
      <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
        <Balance />
        <Activity />
      </div>
    </div>
  );
}
