// lib/auth/guards.ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Role = "admin" | "staff" | "guest";

export async function requireUser(nextPath: string = "/admin") {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return data.user;
}

export async function requireRole(
  allowed: Role[],
  nextPath: string = "/admin"
) {
  const user = await requireUser(nextPath);
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "guest") as Role;

  if (error || !allowed.includes(role)) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { user, role };
}
