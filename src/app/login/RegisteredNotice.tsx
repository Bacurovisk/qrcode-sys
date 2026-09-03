"use client";

import { useSearchParams } from "next/navigation";

export function RegisteredNotice() {
  const searchParams = useSearchParams();
  if (!searchParams.has("registered")) return null;

  return (
    <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
      Conta criada. Faça login para continuar.
    </p>
  );
}
