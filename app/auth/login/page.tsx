"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

  const signInMagicLink = async () => {
    const cleanedEmail = email.trim().toLowerCase();
    if (!cleanedEmail) return;

    setLoading(true);
    setMsg(null);

    try {
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { data, error } = await supabase.auth.signInWithOtp({
        email: cleanedEmail,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      console.log("signInWithOtp data:", data);
      if (error) throw error;

      setMsg("Magic link sent (check inbox/spam/quarantine).");
    } catch (err: any) {
      console.error(err);
      setMsg(err?.message ?? "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        <input
          className="mt-4 w-full rounded-md border px-3 py-2"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <button
          className="mt-4 w-full rounded-md border px-3 py-2"
          onClick={signInMagicLink}
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending..." : "Send magic link"}
        </button>

        {msg && <p className="mt-3 text-sm">{msg}</p>}
      </div>
    </div>
  );
}
