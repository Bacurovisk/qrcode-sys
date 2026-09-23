"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";
import { buildQrOptions, frameExtension, type QrStyle } from "@/lib/qrStyle";

const SAMPLE_DATA = "https://qrcode-sys";

/** Miniatura não-interativa de um estilo — usada nos cards de modelo/padrão/moldura. */
export function QrThumb({ style, size = 64 }: { style: QrStyle; size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const styleRef = useRef(style);
  const styleKey = JSON.stringify(style);

  useEffect(() => {
    const qr = new QRCodeStyling(buildQrOptions(SAMPLE_DATA, styleRef.current, size));
    qr.applyExtension(frameExtension(() => styleRef.current));
    qrRef.current = qr;
    const container = containerRef.current;
    if (container) qr.append(container);
    // Limpa no unmount (e no double-mount do StrictMode, que senão duplicaria o canvas).
    return () => container?.replaceChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    styleRef.current = style;
    qrRef.current?.update(buildQrOptions(SAMPLE_DATA, style, size));
    // styleKey cobre mudanças de conteúdo sem re-render a cada novo objeto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleKey, size]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none [&>canvas]:h-auto [&>canvas]:max-w-full"
    />
  );
}
