import { requireRole } from "@/lib/auth/guards";

export default async function DashboardPage() {
  const { role } = await requireRole(["guest", "admin", "staff"], "/dashboard");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Client Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Logged in as <span className="font-medium">{role}</span>
      </p>
    </div>
  );
}
