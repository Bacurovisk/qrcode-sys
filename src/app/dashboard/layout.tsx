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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="font-semibold">
            qrcode-sys
          </Link>
          <nav className="flex items-center gap-4">
            <DonateButton />
            <span className="text-sm text-neutral-500">{session.user.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
