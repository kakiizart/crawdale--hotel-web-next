import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent(next)}&error=missing_code`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?next=${encodeURIComponent(next)}&error=auth_failed`
    );
  }

  return NextResponse.redirect(`${origin}${next}`);
}
