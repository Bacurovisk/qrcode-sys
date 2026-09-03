"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleExpire = useCallback(() => setTurnstileToken(null), []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Confirme a verificação anti-robô");
      return;
    }

    setLoading(true);
    await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, turnstileToken }),
    });
    setLoading(false);
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);
    setSent(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Esqueci minha senha</h1>

      {sent ? (
        <p className="mt-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          Se esse email tiver uma conta, enviamos um link para redefinir a senha.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <Turnstile key={turnstileKey} onVerify={handleVerify} onExpire={handleExpire} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>
      )}

      <p className="mt-4 text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Voltar para o login
        </Link>
      </p>
    </main>
  );
}
