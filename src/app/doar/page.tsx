import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PixDonation } from "@/components/PixDonation";
import { PIX_KEY_TYPES, type PixKeyType, type PixPayload } from "@/lib/qrContent";

export const metadata: Metadata = {
  title: "Apoie o projeto — qrcode-sys",
};

const PAYPAL_DONATE_URL =
  process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ?? "https://www.paypal.com/donate";

/**
 * Lê a chave Pix das envs do servidor (em runtime, não inlinadas no build).
 * Sem PIX_KEY/PIX_NAME/PIX_CITY o cartão do Pix simplesmente não aparece.
 */
function getPixConfig(): Omit<PixPayload, "amount"> | null {
  const key = process.env.PIX_KEY?.trim();
  const name = process.env.PIX_NAME?.trim();
  const city = process.env.PIX_CITY?.trim();
  if (!key || !name || !city) return null;

  const rawType = process.env.PIX_KEY_TYPE?.trim().toUpperCase() ?? "RANDOM";
  const keyType = PIX_KEY_TYPES.some((t) => t.value === rawType)
    ? (rawType as PixKeyType)
    : "RANDOM";

  return {
    keyType,
    key,
    name,
    city,
    description: process.env.PIX_DESCRIPTION?.trim() || undefined,
  };
}

export default async function DonatePage() {
  await connection();
  const pix = getPixConfig();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-neutral-900">
            qrcode-sys
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold text-neutral-900">Apoie o qrcode-sys</h1>
        <p className="mt-2 leading-relaxed text-neutral-700">
          O qrcode-sys é gratuito e mantido como projeto pessoal. Se ele te ajudou, uma doação de
          qualquer valor ajuda a pagar o servidor. Doações não desbloqueiam nenhuma funcionalidade
          extra — é só um agradecimento. ☕
        </p>

        <div className={`mt-8 grid gap-6 ${pix ? "sm:grid-cols-2" : ""}`}>
          {pix && (
            <section className="rounded-lg border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Pix</h2>
              <p className="mt-1 mb-4 text-sm text-neutral-600">
                Escaneie o QR code no app do seu banco ou use o copia e cola. Recebedor:{" "}
                <strong>{pix.name}</strong>.
              </p>
              <PixDonation pix={pix} />
            </section>
          )}

          <section className="flex flex-col rounded-lg border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">PayPal</h2>
            <p className="mt-1 mb-4 text-sm text-neutral-600">
              Doe com cartão de crédito ou saldo PayPal, de qualquer lugar do mundo.
            </p>
            <div className="mt-auto flex justify-center">
              <a
                href={PAYPAL_DONATE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Doar com PayPal
              </a>
            </div>
          </section>
        </div>

        <p className="mt-12 text-sm text-neutral-600">
          <Link href="/" className="underline">
            Voltar para o início
          </Link>
        </p>
      </main>
    </div>
  );
}
