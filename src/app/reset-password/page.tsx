import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Redefinir senha</h1>

      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <>
          <p className="mt-4 text-neutral-600">Link inválido — falta o token de redefinição.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm underline">
            Pedir um novo link
          </Link>
        </>
      )}
    </main>
  );
}
