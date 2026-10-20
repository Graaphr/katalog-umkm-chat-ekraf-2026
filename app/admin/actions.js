"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesiAdmin } from "@/lib/supabase/server";

export async function masukAdmin(formData) {
  const email = formData?.get ? formData.get("email") : null;
  const password = formData?.get ? formData.get("password") : null;

  if (!email || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("Email dan password wajib diisi."));
  }

  const supabase = await buatClientSesiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    const pesan =
      error.message === "Invalid login credentials"
        ? "Email atau password salah. Silakan coba lagi."
        : error.message || "Gagal masuk. Silakan coba lagi.";
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export const loginAdmin = masukAdmin;

export async function keluarAdmin() {
  const supabase = await buatClientSesiAdmin();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

export const logoutAdmin = keluarAdmin;

