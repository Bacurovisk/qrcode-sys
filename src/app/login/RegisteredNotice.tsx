"use client";

import { useSearchParams } from "next/navigation";

export function RegisteredNotice() {
  const searchParams = useSearchParams();

  let message: string | null = null;
  if (searchParams.has("verified")) {
    message = "Email confirmado. Faça login para continuar.";
  } else if (searchParams.has("reset")) {
    message = "Senha redefinida. Faça login com a nova senha.";
  }

  if (!message) return null;

  return (
    <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>
  );
}
