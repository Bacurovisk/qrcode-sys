"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCodeStyling, { type Options } from "qr-code-styling";
import { buildPix, type PixPayload } from "@/lib/qrContent";

const SUGGESTED_AMOUNTS = [5, 10, 25];

function buildOptions(data: string): Partial<Options> {
  return {
    width: 240,
    height: 240,
    data,
    margin: 8,
    dotsOptions: { type: "square", color: "#111827" },
    cornersSquareOptions: { color: "#111827" },
    backgroundOptions: { color: "#ffffff" },
  };
}

function formatBrl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PixDonation({ pix }: { pix: Omit<PixPayload, "amount"> }) {
  // undefined = valor livre (o pagador digita no app do banco).
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const payload = useMemo(() => buildPix({ ...pix, amount }), [pix, amount]);

  useEffect(() => {
    qrRef.current = new QRCodeStyling(buildOptions(payload));
    if (containerRef.current) {
      qrRef.current.append(containerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    qrRef.current?.update(buildOptions(payload));
  }, [payload]);

  function selectAmount(value: number | undefined) {
    setAmount(value);
    setCopied(false);
    setCopyFailed(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopyFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true);
    }
  }

  const options: { label: string; value: number | undefined }[] = [
    { label: "Valor livre", value: undefined },
    ...SUGGESTED_AMOUNTS.map((v) => ({ label: formatBrl(v), value: v })),
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Valor da doação">
        {options.map((opt) => {
          const selected = opt.value === amount;
          return (
            <button
              key={opt.label}
              type="button"
              aria-pressed={selected}
              onClick={() => selectAmount(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selected
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="rounded-lg border border-neutral-200 bg-white p-3" />

      <p className="text-center text-sm text-neutral-600">
        {amount === undefined
          ? "Você escolhe o valor no app do seu banco."
          : `Doação de ${formatBrl(amount)}.`}
      </p>

      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        {copied ? "Copiado!" : "Copiar código Pix (copia e cola)"}
      </button>

      {copyFailed && (
        <div className="w-full">
          <p className="mb-1 text-sm text-neutral-600">
            Não foi possível copiar automaticamente — selecione e copie o código abaixo:
          </p>
          <textarea
            readOnly
            value={payload}
            rows={4}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full resize-none rounded-md border border-neutral-300 p-2 font-mono text-xs text-neutral-700"
          />
        </div>
      )}
    </div>
  );
}
