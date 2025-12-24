// app/admin/layout.tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only staff/admin can see anything under /admin
  await requireRole(["admin", "staff"], "/admin");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>
            <nav className="text-sm text-muted-foreground flex gap-3">
              <Link href="/admin/rooms">Rooms</Link>
            </nav>
          </div>

          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
