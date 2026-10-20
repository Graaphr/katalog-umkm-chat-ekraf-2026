"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { buatClientServer, buatClientSesiAdmin } from "@/lib/supabase/server";
import { wajibAdmin } from "@/lib/supabase/auth";

// Memastikan admin sudah login di server sebelum menjalankan aksi yang mengubah data
export async function pastikanAdmin(supabase) {
  const client = supabase || (await buatClientSesiAdmin());
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    redirect("/admin/login");
  }

  return user;
}

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
  await pastikanAdmin(supabase);

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

export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  await wajibAdmin();

  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;

  const nama = formData?.get ? formData.get("nama")?.toString().trim() : null;
  const hargaRaw = formData?.get ? formData.get("harga") : null;
  const harga = Number(hargaRaw);
  const kategori = formData?.get ? formData.get("kategori")?.toString().trim() || null : null;
  const foto_url = formData?.get ? formData.get("foto_url")?.toString().trim() || null : null;
  const deskripsi = formData?.get ? formData.get("deskripsi")?.toString().trim() || null : null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (hargaRaw === null || hargaRaw === "" || isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka dan tidak boleh negatif.");
  }

  const supabase = buatClientServer();
  const { error } = await supabase.from("produk").insert({
    nama,
    harga: Math.round(harga),
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    throw new Error(`Gagal menyimpan produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function ubahProduk(idOrFormData, maybeFormData) {
  await wajibAdmin();

  let id;
  let formData;

  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
    formData = maybeFormData;
  } else if (idOrFormData instanceof FormData) {
    formData = idOrFormData;
    id = formData.get("id");
  } else {
    id = idOrFormData;
    formData = maybeFormData;
  }

  const idNum = Number(id);
  if (!id || isNaN(idNum) || idNum <= 0) {
    throw new Error("ID produk tidak valid.");
  }

  const nama = formData?.get ? formData.get("nama")?.toString().trim() : null;
  const hargaRaw = formData?.get ? formData.get("harga") : null;
  const harga = Number(hargaRaw);
  const kategori = formData?.get ? formData.get("kategori")?.toString().trim() || null : null;
  const foto_url = formData?.get ? formData.get("foto_url")?.toString().trim() || null : null;
  const deskripsi = formData?.get ? formData.get("deskripsi")?.toString().trim() || null : null;

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (hargaRaw === null || hargaRaw === "" || isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka dan tidak boleh negatif.");
  }

  const supabase = buatClientServer();
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga: Math.round(harga),
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", idNum);

  if (error) {
    throw new Error(`Gagal memperbarui produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/produk/${idNum}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function hapusProduk(idOrFormData, maybeFormData) {
  await wajibAdmin();

  let id;
  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
  } else if (idOrFormData instanceof FormData) {
    id = idOrFormData.get("id");
  } else {
    id = idOrFormData;
  }

  const idNum = Number(id);
  if (!id || isNaN(idNum) || idNum <= 0) {
    throw new Error("ID produk tidak valid.");
  }

  const supabase = buatClientServer();
  const { error } = await supabase.from("produk").delete().eq("id", idNum);

  if (error) {
    throw new Error(`Gagal menghapus produk: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
