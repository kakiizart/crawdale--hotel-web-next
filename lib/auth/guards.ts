// lib/auth/guards.ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "staff" | "guest";

export async function requireUser(nextPath: string = "/dashboard") {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}

export async function requireRole(
  allowed: Role[],
  nextPath: string = "/dashboard"
) {
  const { supabase, user } = await requireUser(nextPath);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "guest") as Role;

  // If they’re logged in but don’t have permission:
  if (error || !allowed.includes(role)) {
    redirect(`/403?next=${encodeURIComponent(nextPath)}`);
  }

  return { user, role };
}
