import { redirect } from "next/navigation";
import { buatClientSesiAdmin } from "./server";

// Memeriksa sesi login admin. Jika belum login, aksi ditolak dan dialihkan ke /admin/login.
export async function wajibAdmin() {
  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return { user, supabase };
}

