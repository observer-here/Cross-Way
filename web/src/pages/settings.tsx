import { usePrivy } from "@privy-io/react-auth";
import { useState, type FormEvent } from "react";

import { updateMe } from "@/api/users";
import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { Field, Input, Submit } from "@/shared/ui/field";

export function SettingsPage() {
  const { getAccessToken, user, logout } = usePrivy();
  const { me, wallet } = useSession();
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("Saving…");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not signed in");
      await updateMe(token, {
        username: String(fd.get("username") || "") || undefined,
        userId: String(fd.get("userId") || "") || undefined,
      });
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <section className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form className="panel mt-8 flex flex-col gap-5 p-6" onSubmit={onSubmit}>
        <p className="text-sm text-slate-500">{user?.email?.address ?? me?.email}</p>
        {wallet && (
          <a href={`${ARC.explorer}/address/${wallet}`} className="break-all font-mono text-xs text-indigo-500" target="_blank" rel="noreferrer">
            {wallet}
          </a>
        )}
        <Field label="Username">
          <Input name="username" defaultValue={me?.username ?? ""} placeholder="alice" />
        </Field>
        <Field label="User ID">
          <Input name="userId" defaultValue={me?.user_id ?? ""} placeholder="user-42" />
        </Field>
        <Submit>Save</Submit>
        {status && <p className="text-sm text-slate-500">{status}</p>}
        <button type="button" onClick={() => logout()} className="text-sm text-slate-400">
          Log out
        </button>
      </form>
    </section>
  );
}
