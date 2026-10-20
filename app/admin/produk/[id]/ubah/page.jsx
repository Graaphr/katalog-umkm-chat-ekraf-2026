import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { buatClientServer } from "@/lib/supabase/server";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

async function ambilProduk(id) {
  const supabase = buatClientServer();
  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "22P02") return null;
    throw new Error(`Gagal memuat produk: ${error.message}`);
  }

  return data;
}

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        action={ubahProduk.bind(null, produk.id)}
        labelTombol="Simpan perubahan"
      />
    </div>
  );
}
