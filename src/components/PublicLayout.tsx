import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";

// Estáticos de propósito (sem getServerSession): home e /qr-code-pix continuam
// geradas no build. Quem já está logado passa pelo /login e cai no dashboard.

export function PublicHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="font-semibold text-neutral-900">
          qrcode-sys
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/qr-code-pix" className="text-neutral-600 hover:text-neutral-900">
            <span className="sm:hidden">Pix</span>
            <span className="hidden sm:inline">QR code Pix</span>
          </Link>
          <Link href="/qr-code-whatsapp" className="text-neutral-600 hover:text-neutral-900">
            <span className="sm:hidden">WhatsApp</span>
            <span className="hidden sm:inline">QR code WhatsApp</span>
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white hover:bg-neutral-800"
          >
            Entrar
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-sm text-neutral-600 sm:flex-row sm:justify-between">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/" className="hover:text-neutral-900 hover:underline">
            Gerador de QR code
          </Link>
          <Link href="/qr-code-pix" className="hover:text-neutral-900 hover:underline">
            QR code Pix
          </Link>
          <Link href="/qr-code-whatsapp" className="hover:text-neutral-900 hover:underline">
            QR code WhatsApp
          </Link>
          <Link href="/politica-privacidade" className="hover:text-neutral-900 hover:underline">
            Política de Privacidade
          </Link>
          <Link href="/termos-uso" className="hover:text-neutral-900 hover:underline">
            Termos de Uso
          </Link>
        </nav>
        <DonateButton />
      </div>
    </footer>
  );
}
