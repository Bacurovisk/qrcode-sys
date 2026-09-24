import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QrDetailClient } from "./QrDetailClient";

export default async function QrDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  // Confere aqui mesmo, sem contar com o redirect do layout: layout e página
  // renderizam em paralelo. E nunca `session?.user?.id` direto no where — com
  // undefined o Prisma ignora o filtro e devolveria QR codes de todo mundo.
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const qrCode = await prisma.qrCode.findUnique({
    where: { id },
    include: {
      scanEvents: { orderBy: { scannedAt: "desc" }, take: 20 },
      _count: { select: { scanEvents: true } },
    },
  });

  if (!qrCode || qrCode.userId !== userId) {
    notFound();
  }

  return (
    <QrDetailClient
      qrCode={{
        id: qrCode.id,
        name: qrCode.name,
        type: qrCode.type,
        kind: qrCode.kind,
        slug: qrCode.slug,
        payload: qrCode.payload as Record<string, unknown>,
        style: qrCode.style as Record<string, unknown>,
        totalScans: qrCode._count.scanEvents,
        recentScans: qrCode.scanEvents.map((s) => ({
          id: s.id,
          scannedAt: s.scannedAt.toISOString(),
          userAgent: s.userAgent,
          referrer: s.referrer,
        })),
      }}
    />
  );
}
