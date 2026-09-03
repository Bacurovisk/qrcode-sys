import { createHash } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hashIp(ip: string): string {
  const salt = process.env.SCAN_IP_SALT ?? "qrcode-sys";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const qrCode = await prisma.qrCode.findUnique({ where: { slug } });
  if (!qrCode || qrCode.type !== "DYNAMIC") {
    return NextResponse.json({ error: "QR code não encontrado" }, { status: 404 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";

  await prisma.scanEvent.create({
    data: {
      qrCodeId: qrCode.id,
      userAgent: request.headers.get("user-agent") ?? undefined,
      referrer: request.headers.get("referer") ?? undefined,
      ipHash: ip ? hashIp(ip) : undefined,
    },
  });

  return NextResponse.redirect(qrCode.targetUrl, { status: 302 });
}
