"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { QrEditor, type QrStyle } from "@/components/QrEditor";
import { QrPayloadFields } from "@/components/qr-forms/QrPayloadFields";
import { getStaticContent, QR_KINDS, type QrKind } from "@/lib/qrContent";

type ScanEvent = {
  id: string;
  scannedAt: string;
  userAgent: string | null;
  referrer: string | null;
};

type QrCodeDetail = {
  id: string;
  name: string;
  type: "STATIC" | "DYNAMIC";
  kind: QrKind;
  slug: string | null;
  payload: Record<string, unknown>;
  style: Record<string, unknown>;
  totalScans: number;
  recentScans: ScanEvent[];
};

function kindLabel(kind: QrKind): string {
  return QR_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

export function QrDetailClient({ qrCode }: { qrCode: QrCodeDetail }) {
  const router = useRouter();
  const [name, setName] = useState(qrCode.name);
  const [payload, setPayload] = useState<Record<string, unknown>>(qrCode.payload);
  const [style, setStyle] = useState<QrStyle>(qrCode.style as QrStyle);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const encodedData = useMemo(() => {
    if (qrCode.type === "DYNAMIC" && qrCode.slug) {
      if (typeof window !== "undefined") {
        return `${window.location.origin}/r/${qrCode.slug}`;
      }
      return `/r/${qrCode.slug}`;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getStaticContent(qrCode.kind, payload as any) || "";
    } catch {
      return "";
    }
  }, [qrCode.type, qrCode.slug, qrCode.kind, payload]);

  async function handleSave() {
    setError(null);
    setSaved(false);
    setSaving(true);

    const body: Record<string, unknown> = { name, style };
    if (qrCode.type === "DYNAMIC") {
      body.payload = payload;
    }

    const res = await fetch(`/api/qrcodes/${qrCode.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      const resBody = await res.json().catch(() => ({}));
      setError(resBody.error ?? "Não foi possível salvar");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Excluir este QR code? Essa ação não pode ser desfeita.")) return;
    setDeleting(true);
    const res = await fetch(`/api/qrcodes/${qrCode.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setDeleting(false);
      setError("Não foi possível excluir");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-neutral-900">{qrCode.name}</h1>
          <p className="text-sm text-neutral-600">{kindLabel(qrCode.kind)}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Excluindo..." : "Excluir"}
        </button>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <QrEditor data={encodedData} value={style} onChange={setStyle} fileNamePrefix={qrCode.name} />
      </div>

      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="font-medium text-neutral-900">Editar</h2>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {qrCode.type === "DYNAMIC" ? (
          <QrPayloadFields kind={qrCode.kind} payload={payload} onChange={setPayload} />
        ) : (
          <p className="text-sm text-neutral-600">
            QR estático: o conteúdo já está impresso no desenho e não pode ser alterado. Crie um
            novo QR code se precisar de outro conteúdo.
          </p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Salvo.</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>

      {qrCode.type === "DYNAMIC" && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <h2 className="font-medium text-neutral-900">Estatísticas</h2>
          <p className="mt-1 text-3xl font-semibold text-neutral-900">{qrCode.totalScans}</p>
          <p className="text-sm text-neutral-600">scans no total</p>

          {qrCode.recentScans.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-neutral-600">
                    <th className="pb-2 pr-4 font-medium">Data</th>
                    <th className="pb-2 font-medium">Origem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {qrCode.recentScans.map((scan) => (
                    <tr key={scan.id}>
                      <td className="whitespace-nowrap py-2 pr-4 text-neutral-900">
                        {new Date(scan.scannedAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="max-w-[200px] truncate py-2 text-neutral-600">
                        {scan.referrer ?? "Direto"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
