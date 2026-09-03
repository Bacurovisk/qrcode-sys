import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { createVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres"),
  name: z.string().trim().min(1).max(100).optional(),
  turnstileToken: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
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

  const email = parsed.data.email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, name: parsed.data.name },
    select: { id: true, email: true, name: true },
  });

  const token = await createVerificationToken(user.id, "EMAIL_VERIFICATION");
  try {
    await sendVerificationEmail(user.email, token);
  } catch (error) {
    console.error("Falha ao enviar email de verificação", error);
  }

  return NextResponse.json({ user }, { status: 201 });
}
