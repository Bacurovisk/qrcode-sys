import Link from "next/link";
import { connection } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PixDonation } from "@/components/PixDonation";
import { PIX_KEY_TYPES, type PixKeyType, type PixPayload } from "@/lib/qrContent";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Apoie o projeto",
  description:
    "Apoie o qrcode-sys com uma doação via Pix ou PayPal. O gerador de QR code é gratuito e mantido de forma independente.",
  path: "/doar",
});

const PAYPAL_DONATE_URL =
  process.env.NEXT_PUBLIC_PAYPAL_DONATE_URL ?? "https://www.paypal.com/donate";

// Marca "PayPal" do simple-icons (v16.32.0, CC0). Inline porque a CSP só
// permite imagens do próprio domínio.
function PayPalLogo({ className }: { className?: string }) {
  return (
    <svg role="img" viewBox="0 0 24 24" fill="#003087" aria-label="PayPal" className={className}>
      <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z" />
    </svg>
  );
}

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
  const session = await getServerSession(authOptions);
  const back = session?.user
    ? { href: "/dashboard", label: "Voltar para o dashboard" }
    : { href: "/", label: "Voltar para o início" };

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href={back.href} className="font-semibold text-neutral-900">
            qrcode-sys
          </Link>
          {session?.user && (
            <Link href="/dashboard" className="text-sm text-neutral-600 hover:text-neutral-900">
              Dashboard
            </Link>
          )}
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
            <div className="flex flex-1 items-center justify-center py-8">
              <PayPalLogo className="h-24 w-24 sm:h-32 sm:w-32" />
            </div>
            <div className="flex justify-center">
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
          <Link href={back.href} className="underline">
            {back.label}
          </Link>
        </p>
      </main>
    </div>
  );
}
