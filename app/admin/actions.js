"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientSesiAdmin } from "@/lib/supabase/server";

export async function masukAdmin(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const isActionState = maybeFormData instanceof FormData;

  const email = formData?.get ? formData.get("email") : null;
  const password = formData?.get ? formData.get("password") : null;

  if (!email || !password) {
    const pesan = "Email dan password wajib diisi.";
    if (isActionState) return { error: pesan };
    redirect("/admin/login?error=" + encodeURIComponent(pesan));
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
    if (isActionState) return { error: pesan };
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

export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const isActionState = maybeFormData instanceof FormData;

  const passwordBaru = formData?.get ? formData.get("password_baru") : null;
  const konfirmasiPassword = formData?.get ? formData.get("konfirmasi_password") : null;

  if (!passwordBaru || !konfirmasiPassword) {
    const pesan = "Password baru dan konfirmasi password wajib diisi.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  if (String(passwordBaru).length < 8) {
    const pesan = "Password baru minimal 8 karakter.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  if (passwordBaru !== konfirmasiPassword) {
    const pesan = "Password baru dan konfirmasi password tidak sama.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  const supabase = await buatClientSesiAdmin();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    const pesan = error.message || "Gagal mengganti password. Silakan coba lagi.";
    if (isActionState) return { error: pesan };
    redirect("/admin/password?error=" + encodeURIComponent(pesan));
  }

  const pesanSukses = "Password berhasil diganti.";
  if (isActionState) return { sukses: pesanSukses };
  redirect("/admin/password?sukses=" + encodeURIComponent(pesanSukses));
}
