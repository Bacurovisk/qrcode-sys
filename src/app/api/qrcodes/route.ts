import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { qrPayloadSchema } from "@/lib/qrPayloadSchema";
import { DYNAMIC_ONLY_KINDS } from "@/lib/qrContent";

const baseSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(["STATIC", "DYNAMIC"]),
  style: z.record(z.string(), z.unknown()).optional().default({}),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const qrCodes = await prisma.qrCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { scanEvents: true } } },
  });

  return NextResponse.json({ qrCodes });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const base = baseSchema.safeParse(body);
  if (!base.success) {
    return NextResponse.json(
      { error: base.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const kindPayload = qrPayloadSchema.safeParse(body);
  if (!kindPayload.success) {
    return NextResponse.json(
      { error: kindPayload.error.issues[0]?.message ?? "Dados inválidos para este tipo de QR" },
      { status: 400 }
    );
  }

  const { name, style } = base.data;
  const { kind, payload } = kindPayload.data;
  const type = DYNAMIC_ONLY_KINDS.includes(kind) ? "DYNAMIC" : base.data.type;

  let slug: string | undefined;
  if (type === "DYNAMIC") {
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateSlug();
      const exists = await prisma.qrCode.findUnique({ where: { slug: candidate } });
      if (!exists) {
        slug = candidate;
        break;
      }
    }
    if (!slug) {
      return NextResponse.json(
        { error: "Não foi possível gerar um slug único, tente novamente" },
        { status: 500 }
      );
    }
  }

  const qrCode = await prisma.qrCode.create({
    data: {
      name,
      type,
      kind,
      payload: payload as Prisma.InputJsonValue,
      style: style as Prisma.InputJsonValue,
      slug,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ qrCode }, { status: 201 });
}
