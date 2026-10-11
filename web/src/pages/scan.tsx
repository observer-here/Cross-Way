import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import jsQR from "jsqr";

import { useSession } from "@/auth/session";
import { ARC } from "@/chain/arc";
import { shortAddress } from "@/lib/format";
import { SideMark, SoftIcon } from "@/shared/ui/mark";
import { QrCode } from "@/shared/ui/qr";

export function ScanPage() {
  const [params] = useSearchParams();
  return params.has("me") ? <MyCode /> : <CameraScan />;
}

function CameraScan() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const [hint, setHint] = useState("Point at a CrossWay QR");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let live = true;
    let raf = 0;
    let stream: MediaStream | undefined;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    void (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: "environment" } } });
        if (!live) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        const tick = () => {
          if (!live || !ctx) return;
          if (video.readyState >= 2 && video.videoWidth) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
            const path = code?.data ? pathFromQr(code.data) : null;
            if (path) {
              live = false;
              stream?.getTracks().forEach((t) => t.stop());
              nav(path);
              return;
            }
            if (code?.data) setHint("Not a payment QR");
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        if (live) setErr("Allow camera to scan a QR code.");
      }
    })();

    return () => {
      live = false;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [nav]);

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pix = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const path = pathFromQr(jsQR(pix.data, pix.width, pix.height)?.data ?? "");
        if (path) nav(path);
        else setHint("Not a payment QR");
      }
      URL.revokeObjectURL(src);
    };
    img.src = src;
  }

  return (
    <div className="page">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-semibold lg:text-2xl">Scan QR</h1>
        <Link to="/scan?me=1" className="text-sm text-indigo-500">
          Your QR
        </Link>
      </div>
      <video ref={videoRef} className="mt-4 h-[min(68vh,540px)] w-full rounded-2xl bg-slate-950 object-cover" playsInline muted autoPlay />
      <p className="mt-3 text-sm text-slate-500">{err || hint}</p>
      <label className="mt-2 inline-block cursor-pointer text-sm text-indigo-500">
        Choose image
        <input type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
    </div>
  );
}

function MyCode() {
  const { wallet } = useSession();
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");

  if (!wallet) return <p className="page text-sm text-slate-500">Waiting for wallet…</p>;

  return (
    <div className="page grid items-start gap-6 lg:grid-cols-[180px_minmax(0,1fr)_260px]">
      <SideMark text="Receive payments. Share your QR code.">
        <SoftIcon className="bg-violet-50 text-violet-500">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 4h4v4h-4v-4z" />
          </svg>
        </SoftIcon>
      </SideMark>
      <section className="flex flex-col items-center">
        <div className="flex w-full max-w-md items-center justify-between">
          <h1 className="text-xl font-semibold lg:text-2xl">Your QR Code</h1>
          <Link to="/scan" className="text-sm text-indigo-500">
            Scan
          </Link>
        </div>
        <div className="panel mt-3 flex w-full max-w-md flex-col items-center p-5 lg:mt-6 lg:p-8">
          <div className="flex rounded-full bg-slate-100 p-1 text-sm">
            {(["USDC", "EURC"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setToken(item)}
                className={`rounded-full px-4 py-1.5 ${token === item ? "bg-white shadow-sm" : "text-slate-400"}`}
              >
                {item}
              </button>
            ))}
          </div>
          <QrCode value={`${window.location.origin}/send?to=${wallet}`} size={208} className="mt-6 p-2" />
          <button type="button" onClick={() => void navigator.clipboard.writeText(wallet)} className="mt-6 rounded-full bg-slate-950 px-5 py-2.5 text-sm text-white">
            Copy Address
          </button>
          <p className="mt-3 font-mono text-xs text-slate-400">{shortAddress(wallet)}</p>
        </div>
      </section>
      <aside className="panel p-4 text-sm lg:p-6">
        <p className="font-semibold">Receive to</p>
        <p className="mt-3 text-slate-500">USDC / EURC</p>
        <p className="mt-6 font-semibold">Network</p>
        <p className="mt-2 text-slate-500">{ARC.name}</p>
        <a href={`${ARC.explorer}/address/${wallet}`} className="mt-6 block text-xs text-indigo-500" target="_blank" rel="noreferrer">
          {shortAddress(wallet)}
        </a>
        <p className="mt-6 text-xs leading-5 text-slate-400">Anyone can scan this QR or use your address to send you tokens.</p>
      </aside>
    </div>
  );
}

function pathFromQr(raw: string) {
  const text = raw.trim();
  if (!text) return null;
  const url = URL.canParse(text, window.location.origin) ? new URL(text, window.location.origin) : null;
  if (url?.pathname === "/send") {
    const to = url.searchParams.get("to");
    return to ? `/send?to=${encodeURIComponent(to)}` : "/send";
  }
  const pay = url?.pathname.match(/^\/pay\/(\d+)$/);
  if (pay) return `/pay/${pay[1]}`;
  const eth = text.match(/(?:ethereum:)?(0x[a-fA-F0-9]{40})/i);
  return eth ? `/send?to=${eth[1]}` : null;
}
