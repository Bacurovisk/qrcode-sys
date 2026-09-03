"use client";

import { Suspense, useCallback, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Turnstile } from "@/components/Turnstile";
import { RegisteredNotice } from "./RegisteredNotice";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const handleExpire = useCallback(() => setTurnstileToken(null), []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResent(false);

    if (!turnstileToken) {
      setError("Confirme a verificação anti-robô");
      return;
    }

    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      turnstileToken,
      redirect: false,
    });

    setLoading(false);
    setTurnstileToken(null);
    setTurnstileKey((k) => k + 1);

    if (result?.error === "EMAIL_NOT_VERIFIED") {
      setNeedsVerification(true);
      return;
    }

    if (result?.error) {
      setError("Email ou senha inválidos");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleResend() {
    await fetch("/api/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setResent(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Entrar</h1>
      <Suspense fallback={null}>
        <RegisteredNotice />
      </Suspense>
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
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-neutral-700">Senha</label>
            <Link href="/forgot-password" className="text-sm text-neutral-600 underline">
              Esqueceu a senha?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <Turnstile key={turnstileKey} onVerify={handleVerify} onExpire={handleExpire} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {needsVerification && (
          <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p>Confirme seu email antes de entrar — veja a caixa de entrada.</p>
            {resent ? (
              <p className="mt-1 font-medium">Email reenviado.</p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="mt-1 font-medium underline"
              >
                Reenviar email de verificação
              </button>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !turnstileToken}
          className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-neutral-600">
        Não tem conta?{" "}
        <Link href="/register" className="font-medium text-neutral-900 underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
