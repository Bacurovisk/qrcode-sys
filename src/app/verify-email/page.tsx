import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { consumeToken } from "@/lib/tokens";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let success = false;
  if (token) {
    const userId = await consumeToken(token, "EMAIL_VERIFICATION");
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: new Date() },
      });
      success = true;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center">
      {success ? (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">Email confirmado</h1>
          <p className="mt-4 text-neutral-600">Sua conta foi verificada. Já pode entrar.</p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">Link inválido ou expirado</h1>
          <p className="mt-4 text-neutral-600">
            Esse link de confirmação não é mais válido. Tente entrar — se sua conta ainda não
            estiver verificada, você poderá pedir um novo email.
          </p>
        </>
      )}
      <Link
        href={success ? "/login?verified=1" : "/login"}
        className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Ir para o login
      </Link>
    </main>
  );
}
