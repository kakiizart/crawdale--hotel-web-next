// app/dashboard/layout.tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Any signed-in role can access dashboard
  await requireRole(["guest", "admin", "staff"], "/dashboard");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold">
            Dashboard
          </Link>

          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
