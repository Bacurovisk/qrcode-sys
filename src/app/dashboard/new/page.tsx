"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QrEditor, type QrStyle } from "@/components/QrEditor";
import { QrPayloadFields, defaultPayloadFor } from "@/components/qr-forms/QrPayloadFields";
import { QR_KINDS, DYNAMIC_ONLY_KINDS, getStaticContent, type QrKind } from "@/lib/qrContent";

function coerceForPreview(kind: QrKind, payload: Record<string, unknown>): Record<string, unknown> {
  if (kind === "LOCATION") {
    return {
      ...payload,
      lat: Number.parseFloat(String(payload.lat)) || 0,
      lng: Number.parseFloat(String(payload.lng)) || 0,
    };
  }
  if (kind === "PIX") {
    const amount = Number.parseFloat(String(payload.amount));
    return { ...payload, amount: Number.isFinite(amount) && amount > 0 ? amount : undefined };
  }
  if (kind === "WIFI") {
    return { ...payload, hidden: Boolean(payload.hidden) };
  }
  return payload;
}

function previewContent(kind: QrKind, payload: Record<string, unknown>): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = getStaticContent(kind, coerceForPreview(kind, payload) as any);
    return content || "Preencha os campos para ver o QR";
  } catch {
    return "Preencha os campos para ver o QR";
  }
}

export default function NewQrCodePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<QrKind>("URL");
  const [type, setType] = useState<"STATIC" | "DYNAMIC">("DYNAMIC");
  const [payload, setPayload] = useState<Record<string, unknown>>(defaultPayloadFor("URL"));
  const [style, setStyle] = useState<QrStyle>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isDynamicOnly = DYNAMIC_ONLY_KINDS.includes(kind);
  const effectiveType = isDynamicOnly ? "DYNAMIC" : type;

  const previewData = useMemo(() => previewContent(kind, payload), [kind, payload]);

  function handleKindChange(next: QrKind) {
    setKind(next);
    setPayload(defaultPayloadFor(next));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/qrcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type: effectiveType, kind, payload, style }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Não foi possível criar o QR code");
      return;
    }

    const { qrCode } = await res.json();
    router.push(`/dashboard/${qrCode.id}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Novo QR code</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do QR code"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Tipo de conteúdo</label>
            <select
              value={kind}
              onChange={(e) => handleKindChange(e.target.value as QrKind)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              {QR_KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">Estático ou dinâmico</label>
          <select
            value={effectiveType}
            disabled={isDynamicOnly}
            onChange={(e) => setType(e.target.value as "STATIC" | "DYNAMIC")}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
          >
            <option value="DYNAMIC">Dinâmico (com estatísticas de scan, editável depois)</option>
            <option value="STATIC">Estático (sem rastreamento, conteúdo fixo)</option>
          </select>
          {isDynamicOnly && (
            <p className="mt-1 text-sm text-neutral-600">
              QR de aplicativo só funciona como dinâmico — é o nosso servidor que detecta Android
              ou iPhone na hora do scan e manda pra loja certa.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <QrPayloadFields kind={kind} payload={payload} onChange={setPayload} />
        </div>

        <div>
          <h2 className="text-sm font-medium text-neutral-700">Aparência</h2>
          <div className="mt-2 rounded-lg border border-neutral-200 bg-white p-4">
            <QrEditor data={previewData} value={style} onChange={setStyle} />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar QR code"}
        </button>
      </form>
    </div>
  );
}
