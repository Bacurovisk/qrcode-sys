import Link from "next/link";
import { DonateButton } from "@/components/DonateButton";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900">qrcode-sys</h1>
      <p className="mt-4 max-w-xl text-neutral-600">
        Crie QR codes estáticos e dinâmicos, personalize o desenho com cores, formas e logo, e
        acompanhe estatísticas de scan em tempo real. Grátis, sem pegadinha.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/register"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Criar conta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-100"
        >
          Entrar
        </Link>
      </div>
      <div className="mt-10">
        <DonateButton />
      </div>
    </main>
  );
}
