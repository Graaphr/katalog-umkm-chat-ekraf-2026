import KartuProduk from "@/components/KartuProduk";
import { buatClientServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

// Katalog selalu diambil dari database, bukan di-cache saat build.
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

export default async function HalamanKatalog() {
  const { daftarProduk, galat } = await ambilProduk();

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5">
        <h2 id="judul-produk" className="text-xl font-bold">
          Produk kami
        </h2>

        {galat ? (
          <p role="alert" className="rounded-lg border border-bahaya px-3 py-2 text-sm text-bahaya">
            Gagal memuat produk: {galat}. Silakan muat ulang halaman atau coba lagi nanti.
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="text-teks-lembut">Belum ada produk</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}