import { useEffect, useRef } from "react";
import QR from "qrcode";

export function QrCode({ value, size = 200, className = "" }: { value: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !value) return;
    let cancelled = false;

    void (async () => {
      await QR.toCanvas(canvas, value, {
        width: size,
        margin: 1,
        color: { dark: "#111318", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.src = "/logo.png";
      await img.decode();
      if (cancelled) return;
      const mark = size * 0.22;
      const pad = mark * 0.16;
      const box = mark + pad * 2;
      const x = (canvas.width - box) / 2;
      const y = (canvas.height - box) / 2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(x, y, box, box, box * 0.22);
      ctx.fill();
      ctx.drawImage(img, x + pad, y + pad, mark, mark);
    })();

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (!value) return <div className={`rounded-xl bg-white ${className}`} style={{ width: size, height: size }} />;
  return <canvas ref={ref} className={`rounded-xl bg-white ${className}`} />;
}
