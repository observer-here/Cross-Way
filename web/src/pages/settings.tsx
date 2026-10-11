import { usePrivy } from "@privy-io/react-auth";
import { useRef, useState, type FormEvent } from "react";

import { avatarSrc, toAvatarJpeg, updateMe, uploadAvatar } from "@/api/users";
import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { labelOf } from "@/lib/format";
import { Avatar } from "@/shared/ui/avatar";
import { Field, Input, Submit } from "@/shared/ui/field";

const tabs = ["Profile", "Wallet"] as const;

export function SettingsPage() {
  const { getAccessToken, user, logout } = usePrivy();
  const { me, wallet, setMe } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Profile");
  const [status, setStatus] = useState("");
  const name = labelOf(me?.email, me?.username, wallet);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "") || undefined;
    const userId = String(fd.get("userId") || "") || undefined;
    setStatus("Saving…");
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("not signed in");
      setMe(await updateMe(token, { username, userId }));
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
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-1">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-4 py-2 text-left text-sm ${tab === item ? "bg-white shadow-sm" : "text-slate-500"}`}
            >
              {item}
            </button>
          ))}
          <button type="button" onClick={() => logout()} className="rounded-full px-4 py-2 text-left text-sm text-slate-400">
            Log out
          </button>
        </aside>
        {tab === "Profile" ? (
          <form className="panel flex flex-col gap-5 p-6" onSubmit={onSubmit}>
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
              <Input name="username" defaultValue={me?.username ?? ""} placeholder="alice" />
            </Field>
            <Field label="Email">
              <Input value={user?.email?.address ?? me?.email ?? ""} readOnly />
            </Field>
            <Field label="User ID">
              <Input name="userId" defaultValue={me?.user_id ?? ""} placeholder="user_1024" />
            </Field>
            <Submit>Save Changes</Submit>
            {status && <p className="text-sm text-slate-500">{status}</p>}
          </form>
        ) : (
          <div className="panel p-6">
            <p className="text-sm text-slate-400">Connected wallet</p>
            {wallet ? (
              <a href={`${ARC.explorer}/address/${wallet}`} className="mt-3 block break-all font-mono text-sm text-indigo-500" target="_blank" rel="noreferrer">
                {wallet}
              </a>
            ) : (
              <p className="mt-3 text-sm">Waiting for wallet…</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
