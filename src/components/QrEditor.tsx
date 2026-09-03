"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling, { type DotType, type Options } from "qr-code-styling";

export type QrStyle = {
  dotsOptions?: { type?: DotType; color?: string };
  backgroundOptions?: { color?: string };
  cornersSquareOptions?: { color?: string };
  image?: string;
};

const DOT_TYPES: { value: DotType; label: string }[] = [
  { value: "square", label: "Quadrado" },
  { value: "dots", label: "Pontos" },
  { value: "rounded", label: "Arredondado" },
  { value: "classy", label: "Clássico" },
  { value: "classy-rounded", label: "Clássico arredondado" },
  { value: "extra-rounded", label: "Extra arredondado" },
];

function buildOptions(data: string, style: QrStyle): Partial<Options> {
  return {
    width: 260,
    height: 260,
    data,
    margin: 8,
    image: style.image,
    imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 4 },
    dotsOptions: {
      type: style.dotsOptions?.type ?? "square",
      color: style.dotsOptions?.color ?? "#111827",
    },
    cornersSquareOptions: {
      color: style.cornersSquareOptions?.color ?? style.dotsOptions?.color ?? "#111827",
    },
    backgroundOptions: {
      color: style.backgroundOptions?.color ?? "#ffffff",
    },
  };
}

export function QrEditor({
  data,
  value,
  onChange,
  fileNamePrefix = "qrcode",
}: {
  data: string;
  value: QrStyle;
  onChange: (style: QrStyle) => void;
  fileNamePrefix?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    qrRef.current = new QRCodeStyling(buildOptions(data, value));
    if (containerRef.current) {
      qrRef.current.append(containerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    qrRef.current?.update(buildOptions(data, value));
  }, [data, value]);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500_000) {
      setLogoError("Imagem muito grande (máx. 500KB)");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row">
      <div className="flex flex-col items-center gap-3">
        <div ref={containerRef} className="rounded-lg border border-neutral-200 bg-white p-3" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => qrRef.current?.download({ extension: "png", name: fileNamePrefix })}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Baixar PNG
          </button>
          <button
            type="button"
            onClick={() => qrRef.current?.download({ extension: "svg", name: fileNamePrefix })}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
          >
            Baixar SVG
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Estilo dos pontos</label>
          <select
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            value={value.dotsOptions?.type ?? "square"}
            onChange={(e) =>
              onChange({
                ...value,
                dotsOptions: { ...value.dotsOptions, type: e.target.value as DotType },
              })
            }
          >
            {DOT_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700">Cor</label>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded-md border border-neutral-300"
              value={value.dotsOptions?.color ?? "#111827"}
              onChange={(e) =>
                onChange({
                  ...value,
                  dotsOptions: { ...value.dotsOptions, color: e.target.value },
                  cornersSquareOptions: { color: e.target.value },
                })
              }
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-neutral-700">Fundo</label>
            <input
              type="color"
              className="mt-1 h-10 w-full rounded-md border border-neutral-300"
              value={value.backgroundOptions?.color ?? "#ffffff"}
              onChange={(e) =>
                onChange({ ...value, backgroundOptions: { color: e.target.value } })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Logo (opcional)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoUpload}
            className="mt-1 block w-full text-sm"
          />
          {logoError && <p className="mt-1 text-sm text-red-600">{logoError}</p>}
          {value.image && (
            <button
              type="button"
              onClick={() => onChange({ ...value, image: undefined })}
              className="mt-2 text-sm text-neutral-500 underline"
            >
              Remover logo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
