import { requireRole } from "@/lib/auth/guards";

export default async function AdminPage() {
  await requireRole(["admin"], "/admin");
  return <div className="p-6">Admin</div>;
}
