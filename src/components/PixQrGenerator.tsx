"use client";

import { useMemo, useState } from "react";
import { QrEditor, type QrStyle } from "@/components/QrEditor";
import { QrPayloadFields, defaultPayloadFor } from "@/components/qr-forms/QrPayloadFields";
import { buildPix } from "@/lib/qrContent";
import { pixPayloadSchema } from "@/lib/qrPayloadSchema";

const PLACEHOLDER = "Preencha os campos para ver o QR";

/**
 * Gerador de QR code Pix sem login: tudo roda no navegador (buildPix + preview),
 * o servidor não recebe nem grava nada — por isso não precisa de rate limit.
 */
export function PixQrGenerator() {
  const [payload, setPayload] = useState<Record<string, unknown>>(defaultPayloadFor("PIX"));
  const [style, setStyle] = useState<QrStyle>({});
  const [copied, setCopied] = useState(false);

  // Mesma validação do servidor ao criar um QR Pix; também converte o valor em número.
  const brCode = useMemo(() => {
    const parsed = pixPayloadSchema.safeParse({ kind: "PIX", payload });
    return parsed.success ? buildPix(parsed.data.payload) : null;
  }, [payload]);

  async function handleCopy() {
    if (!brCode) return;
    try {
      await navigator.clipboard.writeText(brCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o código continua visível pra copiar à mão.
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <QrPayloadFields
          kind="PIX"
          payload={payload}
          onChange={(next) => {
            setPayload(next);
            setCopied(false);
          }}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-medium text-neutral-700">Pix copia e cola</h2>
        {brCode ? (
          <>
            <textarea
              readOnly
              value={brCode}
              rows={3}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Código Pix copia e cola"
              className="mt-2 w-full resize-none rounded-md border border-neutral-300 p-2 font-mono text-xs text-neutral-700"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              {copied ? "Copiado!" : "Copiar código"}
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-neutral-600">
            Preencha chave, nome e cidade para gerar o código.
          </p>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-700">Aparência e download</h2>
        <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-4">
          <QrEditor
            data={brCode ?? PLACEHOLDER}
            value={style}
            onChange={setStyle}
            fileName="qrcode-pix"
            downloadBlockedReason={
              brCode ? null : "Preencha chave, nome e cidade para liberar o download."
            }
          />
        </div>
      </div>
    </div>
  );
}
