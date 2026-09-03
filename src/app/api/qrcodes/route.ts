import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(["STATIC", "DYNAMIC"]),
  targetUrl: z.string().url(),
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
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { name, type, targetUrl, style } = parsed.data;

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
      targetUrl,
      style: style as Prisma.InputJsonValue,
      slug,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ qrCode }, { status: 201 });
}
