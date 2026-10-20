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

export async function buatDeskripsiAI(nama, kategori) {
  try {
    await wajibAdmin();

    const namaProduk = String(nama || "").trim();
    const kategoriProduk = String(kategori || "").trim();

    if (!namaProduk) {
      return { sukses: false, error: "Nama produk wajib diisi sebelum membuat deskripsi dengan AI." };
    }

    if (namaProduk.length > 100) {
      return { sukses: false, error: "Nama produk terlalu panjang (maksimal 100 karakter)." };
    }

    if (kategoriProduk.length > 50) {
      return { sukses: false, error: "Kategori terlalu panjang (maksimal 50 karakter)." };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      return { sukses: false, error: "GEMINI_API_KEY belum diatur di environment variable." };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const prompt = `Tulis deskripsi produk singkat (2-3 kalimat) dalam bahasa Indonesia yang ramah, menarik, dan tanpa klaim palsu atau berlebihan, hanya berdasarkan informasi berikut:
Nama produk: ${namaProduk}
Kategori: ${kategoriProduk || "Umum"}

Tulis langsung deskripsinya saja tanpa tanda kutip, judul, atau pengantar.`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData?.error?.message || `Permintaan ke Gemini gagal (${res.status})`;
        return { sukses: false, error: msg };
      }

      const data = await res.json();
      const hasil = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!hasil) {
        return { sukses: false, error: "Gemini tidak mengembalikan teks deskripsi." };
      }

      return { sukses: true, deskripsi: hasil };
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (err) {
    if (err.name === "AbortError") {
      return { sukses: false, error: "Waktu permintaan ke Gemini habis (timeout). Silakan coba lagi." };
    }
    return { sukses: false, error: err.message || "Gagal membuat deskripsi dengan AI." };
  }
}

