import { requireRole } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["guest", "admin", "staff"], "/dashboard");
  return <>{children}</>;
}
