import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  targetUrl: z.string().url().optional(),
  style: z.record(z.string(), z.unknown()).optional(),
});

async function getOwnedQrCode(id: string, userId: string) {
  const qrCode = await prisma.qrCode.findUnique({ where: { id } });
  if (!qrCode || qrCode.userId !== userId) return null;
  return qrCode;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const qrCode = await prisma.qrCode.findUnique({
    where: { id },
    include: {
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 20 },
      _count: { select: { scanEvents: true } },
    },
  });

  if (!qrCode || qrCode.userId !== session.user.id) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ qrCode });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedQrCode(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  if (parsed.data.targetUrl && existing.type !== "DYNAMIC") {
    return NextResponse.json(
      { error: "Só é possível alterar o destino de QR codes dinâmicos" },
      { status: 400 }
    );
  }

  const qrCode = await prisma.qrCode.update({
    where: { id },
    data: parsed.data as Prisma.QrCodeUpdateInput,
  });

  return NextResponse.json({ qrCode });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getOwnedQrCode(id, session.user.id);
  if (!existing) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  await prisma.qrCode.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
