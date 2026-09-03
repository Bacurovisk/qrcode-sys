import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { DonateButton } from "@/components/DonateButton";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <Link href="/dashboard" className="font-semibold">
            qrcode-sys
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <DonateButton />
            <span className="hidden text-sm text-neutral-600 sm:inline">
              {session.user.email}
            </span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
