import Link from "next/link";

// O Next já injeta <meta name="robots" content="noindex"> em respostas 404.
export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium text-neutral-500">Erro 404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900">Página não encontrada</h1>
      <p className="mt-4 text-neutral-600">
        O endereço pode ter sido digitado errado ou a página não existe mais. Se você chegou aqui
        escaneando um QR code, ele pode ter sido excluído por quem o criou.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Ir para o início
        </Link>
        <Link
          href="/qr-code-pix"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-100"
        >
          Gerar QR code Pix
        </Link>
      </div>
    </main>
  );
}
