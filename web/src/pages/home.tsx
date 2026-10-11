import { Actions } from "@/features/dashboard/actions";
import { Activity } from "@/features/dashboard/activity";
import { Balance } from "@/features/dashboard/balance";
import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { labelOf } from "@/lib/format";

export function HomePage() {
  const { me } = useSession();
  const name = labelOf(me?.username, me?.email).replace(/^@/, "");

  return (
    <div className="page">
      <p className="text-base font-normal text-slate-400 italic lg:text-[22px]">Welcome back,</p>
      {name ? (
        <h1 className="mt-0.5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-none">{name}</h1>
      ) : (
        <span className="skel mt-1.5 h-10 w-52 rounded-lg sm:h-12 sm:w-72 lg:h-14 lg:w-80" />
      )}
      <p className="mt-1.5 text-xs text-slate-500 lg:mt-3 lg:text-sm">Send, receive and manage your payments on {ARC.name}.</p>
      <div className="mt-4 lg:mt-8">
        <Actions />
      </div>
      <div className="mt-3 grid items-stretch gap-3 lg:mt-4 lg:gap-4 lg:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.18fr)]">
        <Balance />
        <Activity />
      </div>
    </div>
  );
}
