"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("getSession error:", error);
      console.log("Session:", data.session);
    });
  }, []);

  return <h1>Crawdale is alive 🏨</h1>;
}
