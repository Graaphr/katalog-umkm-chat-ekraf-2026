import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function ambilProduk() {
  try {
    const supabase = buatClientServer();
    const { data, error } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .order("created_at", { ascending: false });

    if (error) return { daftarProduk: [], galat: error.message };
    return { daftarProduk: data ?? [], galat: null };
  } catch (e) {
    return { daftarProduk: [], galat: e.message };
  }
}

export default async function HalamanAdmin() {
  const { daftarProduk, galat } = await ambilProduk();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {galat ? (
        <p role="alert" className="rounded-lg border border-bahaya px-3 py-2 text-sm text-bahaya">
          Gagal memuat produk: {galat}. Silakan muat ulang halaman atau coba lagi nanti.
        </p>
      ) : daftarProduk.length === 0 ? (
        <p className="text-teks-lembut">Belum ada produk</p>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
