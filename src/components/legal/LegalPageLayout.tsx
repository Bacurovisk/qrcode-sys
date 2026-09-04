import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="font-semibold text-neutral-900">
            qrcode-sys
          </Link>
          <nav className="flex gap-4 text-sm text-neutral-600">
            <Link href="/politica-privacidade" className="hover:text-neutral-900">
              Privacidade
            </Link>
            <Link href="/termos-uso" className="hover:text-neutral-900">
              Termos
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
        <p className="mt-1 text-sm text-neutral-600">Última atualização: {lastUpdated}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-12 text-sm text-neutral-600">
          <Link href="/" className="underline">
            Voltar para o início
          </Link>
        </p>
      </main>
    </div>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-3 text-lg font-semibold text-neutral-900">{children}</h2>;
}

export function LegalP({ children }: { children: ReactNode }) {
  return <p className="mb-4 leading-relaxed text-neutral-700">{children}</p>;
}

export function LegalUl({ children }: { children: ReactNode }) {
  return <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-700">{children}</ul>;
}
