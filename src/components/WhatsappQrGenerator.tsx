"use client";

import { useMemo, useState } from "react";
import { QrEditor, type QrStyle } from "@/components/QrEditor";
import { QrPayloadFields, defaultPayloadFor } from "@/components/qr-forms/QrPayloadFields";
import { whatsappPayloadSchema } from "@/lib/qrPayloadSchema";
import { LOGO_PRESETS } from "@/lib/qrStyle";
import { buildWhatsappLink } from "@/lib/whatsapp";

const PLACEHOLDER = "Preencha os campos para ver o QR";
const WHATSAPP_LOGO = LOGO_PRESETS.find((l) => l.id === "whatsapp")?.uri;

/**
 * Gerador de QR code de WhatsApp sem login: sempre estático (o link wa.me vai
 * direto na imagem), tudo no navegador — o servidor não recebe nem grava nada.
 */
export function WhatsappQrGenerator() {
  const [payload, setPayload] = useState<Record<string, unknown>>(defaultPayloadFor("WHATSAPP"));
  // Começa com o logo do WhatsApp no centro; dá pra trocar ou tirar no editor.
  const [style, setStyle] = useState<QrStyle>({ image: WHATSAPP_LOGO });
  const [copied, setCopied] = useState(false);

  // Mesma validação/normalização do servidor.
  const link = useMemo(() => {
    const parsed = whatsappPayloadSchema.safeParse({ kind: "WHATSAPP", payload });
    return parsed.success ? buildWhatsappLink(parsed.data.payload) : null;
  }, [payload]);

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o link continua visível acima.
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <QrPayloadFields
          kind="WHATSAPP"
          payload={payload}
          onChange={(next) => {
            setPayload(next);
            setCopied(false);
          }}
        />
        {link && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
            >
              {copied ? "Link copiado!" : "Copiar link"}
            </button>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Testar no WhatsApp
            </a>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-neutral-700">Aparência e download</h2>
        <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-4">
          <QrEditor
            data={link ?? PLACEHOLDER}
            value={style}
            onChange={setStyle}
            fileName="qrcode-whatsapp"
            downloadBlockedReason={
              link ? null : "Escolha o país e preencha o número com DDD para liberar o download."
            }
          />
        </div>
      </div>
    </div>
  );
}
