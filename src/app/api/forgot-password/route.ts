import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createVerificationToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().min(1),
});

// Always responds the same way regardless of whether the account exists,
// to avoid leaking which emails have accounts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const remoteIp = forwardedFor?.split(",")[0]?.trim();

  const humanVerified = await verifyTurnstileToken(parsed.data.turnstileToken, remoteIp);
  if (!humanVerified) {
    return NextResponse.json(
      { error: "Verificação anti-robô falhou, tente novamente" },
      { status: 400 }
    );
  }

  const genericResponse = NextResponse.json({
    message: "Se essa conta existir, enviamos um link de redefinição de senha.",
  });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user) return genericResponse;

  const token = await createVerificationToken(user.id, "PASSWORD_RESET");
  try {
    await sendPasswordResetEmail(user.email, token);
  } catch (error) {
    console.error("Falha ao enviar email de redefinição de senha", error);
  }

  return genericResponse;
}
