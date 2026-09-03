import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createVerificationToken, getLatestToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

const COOLDOWN_MS = 60 * 1000;

// Always responds the same way regardless of whether the account exists or
// is already verified, to avoid leaking which emails have accounts.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  const genericResponse = NextResponse.json({
    message: "Se essa conta existir e ainda não estiver verificada, reenviamos o email.",
  });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || user.emailVerified) return genericResponse;

  const latest = await getLatestToken(user.id, "EMAIL_VERIFICATION");
  if (latest && Date.now() - latest.createdAt.getTime() < COOLDOWN_MS) {
    return genericResponse;
  }

  const token = await createVerificationToken(user.id, "EMAIL_VERIFICATION");
  try {
    await sendVerificationEmail(user.email, token);
  } catch (error) {
    console.error("Falha ao reenviar email de verificação", error);
  }

  return genericResponse;
}
