/** Teto do corpo das requisições de QR code: aparência (≤ 700 KB) + conteúdo, com folga. */
export const MAX_QR_BODY_BYTES = 1024 * 1024;

/**
 * Lê o corpo como JSON recusando antes de parsear o que passar de `maxBytes`
 * (pelo Content-Length quando vier, e pelo tamanho real de qualquer forma).
 * Retorna `undefined` se for grande demais e `null` se não for JSON válido.
 */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return undefined;

  const raw = await request.text().catch(() => null);
  if (raw === null) return null;
  if (new TextEncoder().encode(raw).length > maxBytes) return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
