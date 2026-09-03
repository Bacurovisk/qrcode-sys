import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const qrCodes = await prisma.qrCode.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { scanEvents: true } } },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-neutral-900">Seus QR codes</h1>
        <Link
          href="/dashboard/new"
          className="shrink-0 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          + Novo QR code
        </Link>
      </div>

      {qrCodes.length === 0 ? (
        <p className="mt-8 text-neutral-600">
          Você ainda não criou nenhum QR code.{" "}
          <Link href="/dashboard/new" className="underline">
            Criar o primeiro
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          {qrCodes.map((qr) => (
            <li key={qr.id}>
              <Link
                href={`/dashboard/${qr.id}`}
                className="flex items-center justify-between gap-3 px-4 py-4 hover:bg-neutral-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-neutral-900">{qr.name}</p>
                  <p className="truncate text-sm text-neutral-600">
                    {qr.type === "DYNAMIC" ? "Dinâmico" : "Estático"} · {qr.targetUrl}
                  </p>
                </div>
                {qr.type === "DYNAMIC" && (
                  <span className="shrink-0 text-sm text-neutral-600">
                    {qr._count.scanEvents} scan{qr._count.scanEvents === 1 ? "" : "s"}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
