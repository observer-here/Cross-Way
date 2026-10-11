import { usePrivy } from "@privy-io/react-auth";
import { useRef, useState, type FormEvent } from "react";

import { avatarSrc, toAvatarJpeg, updateMe, uploadAvatar } from "@/api/users";
import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { Activity } from "@/features/dashboard/activity";
import { labelOf } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Field, Input, Submit } from "@/shared/ui/field";

export function SettingsPage() {
  const { getAccessToken, user, logout } = usePrivy();
  const { me, wallet, setMe } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const name = labelOf(me?.username, me?.email);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "") || undefined;
    setStatus("Saving…");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not signed in");
      setMe(await updateMe(token, { username }));
      setStatus("Saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  async function onPic(file: File | undefined) {
    if (!file) return;
    setStatus("Uploading photo…");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not signed in");
      const jpeg = await toAvatarJpeg(file);
      setMe(await uploadAvatar(token, jpeg));
      setStatus("Photo saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "failed");
    }
  }

  return (
    <section className="page">
      <h1 className="text-xl font-semibold lg:text-2xl">Settings</h1>
      <div className="mt-3 grid items-start gap-3 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <form className="panel flex flex-col gap-3 p-4 lg:gap-5 lg:p-6" onSubmit={onSubmit}>
          <div className="flex items-center gap-3">
            <Avatar name={name} src={avatarSrc(me)} size="lg" />
            <div>
              <p className="font-medium">{name}</p>
              <button type="button" className="text-xs text-indigo-500" onClick={() => fileRef.current?.click()}>
                Change
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onPic(e.target.files?.[0])} />
            </div>
          </div>
          <Field label="Username">
            <Input key={me?.username ?? ""} name="username" defaultValue={me?.username ?? ""} placeholder="alice" />
          </Field>
          <Field label="Email">
            <Input value={user?.email?.address ?? me?.email ?? ""} readOnly />
          </Field>
          <Field label="User ID">
            <Input value={me?.user_id ?? ""} readOnly />
          </Field>
          <Field label="Wallet">
            {wallet ? (
              <a href={`${ARC.explorer}/address/${wallet}`} className="break-all font-mono text-sm text-indigo-500" target="_blank" rel="noreferrer">
                {wallet}
              </a>
            ) : (
              <p className="text-sm text-slate-400">Waiting for wallet…</p>
            )}
          </Field>
          <Submit>Save Changes</Submit>
          {status && <p className="text-sm text-slate-500">{status}</p>}
          <button type="button" onClick={() => logout()} className="text-left text-sm text-slate-400">
            Log out
          </button>
        </form>
        <Activity title="Activity" all pageSize={10} />
      </div>
    </section>
  );
}
