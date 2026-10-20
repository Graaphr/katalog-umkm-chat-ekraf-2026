import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { buatClientServer } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/format";

// Detail produk selalu diambil dari database, bukan di-cache saat build.
export const dynamic = "force-dynamic";

async function ambilProduk(id) {
  const supabase = buatClientServer();
  const { data, error } = await supabase
    .from("produk")
    .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    // 22P02: format id tidak valid (misalnya /produk/abc), anggap produk tidak ada.
    if (error.code === "22P02") return null;
    throw new Error(`Gagal memuat produk: ${error.message}`);
  }

  return data;
}

async function ambilProdukTerkait(kategori, idSekarang) {
  if (!kategori) return [];
  try {
    const supabase = buatClientServer();
    const { data } = await supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at")
      .eq("kategori", kategori)
      .neq("id", idSekarang)
      .limit(4);

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const produk = await ambilProduk(id);

  if (!produk) {
    notFound();
  }

  const produkTerkait = await ambilProdukTerkait(produk.kategori, produk.id);

  return (
    <div className="flex flex-col gap-10">
      <article className="grid gap-8 py-8 md:grid-cols-2 md:py-12">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="aspect-square w-full rounded-2xl border border-garis bg-permukaan object-cover"
        />
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
            Kembali ke katalog
          </Link>
          <p className="text-sm text-teks-lembut">{produk.kategori}</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{produk.nama}</h1>
          <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>
          <TombolWhatsApp produk={produk} />
        </div>
      </article>

      {produkTerkait.length > 0 && (
        <section aria-labelledby="judul-terkait" className="border-t border-garis pb-12 pt-6">
          <h2 id="judul-terkait" className="mb-6 text-xl font-bold">
            Produk terkait
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
