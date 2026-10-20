import { createClient } from "@supabase/supabase-js";

// Hanya boleh dipakai dari Server Component, Server Action, atau Route Handler.
// Jangan di-import dari file yang memakai "use client".
export function buatClientServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL atau SUPABASE_SECRET_KEY belum diatur di environment variable.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}