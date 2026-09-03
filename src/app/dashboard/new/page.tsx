"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { QrEditor, type QrStyle } from "@/components/QrEditor";

export default function NewQrCodePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<"STATIC" | "DYNAMIC">("DYNAMIC");
  const [targetUrl, setTargetUrl] = useState("");
  const [style, setStyle] = useState<QrStyle>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewData = targetUrl.trim() || "https://exemplo.com";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/qrcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, targetUrl, style }),
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
      <h1 className="text-2xl font-semibold">Novo QR code</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Nome</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cardápio do restaurante"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "STATIC" | "DYNAMIC")}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="DYNAMIC">Dinâmico (com estatísticas de scan)</option>
              <option value="STATIC">Estático (sem rastreamento)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700">
            {type === "DYNAMIC" ? "URL de destino" : "Conteúdo (URL ou texto)"}
          </label>
          <input
            type="text"
            required
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          {type === "DYNAMIC" && (
            <p className="mt-1 text-sm text-neutral-600">
              O QR final vai apontar para um link curto rastreável — o destino pode ser trocado
              depois sem precisar reimprimir o QR.
            </p>
          )}
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
