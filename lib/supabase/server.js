import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

// Koneksi sesi admin memakai Supabase Auth dan cookie (@supabase/ssr).
// Dipakai untuk login, logout, ganti password, dan aksi admin.
export async function buatClientSesiAdmin() {
  const cookieStore = await cookies();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL atau SUPABASE_PUBLISHABLE_KEY belum diatur di environment variable.");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Method setAll diabaikan jika dipanggil dari Server Component
        }
      },
    },
  });
}

export const buatClientAdmin = buatClientSesiAdmin;
