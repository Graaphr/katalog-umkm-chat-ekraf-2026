import KartuProduk from "@/components/KartuProduk";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatClientServer } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

// Katalog selalu diambil dari database, bukan di-cache saat build.
export const dynamic = "force-dynamic";

const PER_HALAMAN = 6;

async function ambilKategori(supabase) {
  try {
    const { data } = await supabase.from("produk").select("kategori");

    const kategoriUnik = Array.from(
      new Set(
        (data || [])
          .map((item) => item.kategori)
          .filter((kat) => Boolean(kat && kat.trim()))
      )
    ).sort();

    return kategoriUnik;
  } catch {
    return [];
  }
}

async function ambilProduk(q, kategoriDipilih, urutan = "terbaru", halaman = 1) {
  try {
    const supabase = buatClientServer();
    let query = supabase
      .from("produk")
      .select("id, nama, harga, deskripsi, foto_url, kategori, created_at", { count: "exact" });

    // US-15: Urutan diterapkan langsung pada query database
    if (urutan === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutan === "termahal") {
      query = query.order("harga", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    if (q) {
      query = query.ilike("nama", `%${q}%`);
    }

    if (kategoriDipilih) {
      query = query.eq("kategori", kategoriDipilih);
    }

    // US-16: Pembatasan jumlah dan offset di query database
    const dari = (halaman - 1) * PER_HALAMAN;
    const sampai = dari + PER_HALAMAN - 1;
    query = query.range(dari, sampai);

    const [{ data: daftarProduk, count, error: errProduk }, daftarKategori] =
      await Promise.all([query, ambilKategori(supabase)]);

    if (errProduk) {
      return { daftarProduk: [], total: 0, totalHalaman: 0, daftarKategori: [], galat: errProduk.message };
    }

    const total = count ?? 0;
    const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN));

    return {
      daftarProduk: daftarProduk ?? [],
      total,
      totalHalaman,
      daftarKategori,
      galat: null,
    };
  } catch (e) {
    return { daftarProduk: [], total: 0, totalHalaman: 0, daftarKategori: [], galat: e.message };
  }
}

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  const kategoriDipilih = params?.kategori?.trim() || "";
  const urutan = params?.urutan?.trim() || "terbaru";
  const halaman = Math.max(1, parseInt(params?.halaman, 10) || 1);
  const adaFilter = Boolean(q || kategoriDipilih || (urutan && urutan !== "terbaru"));

  const { daftarProduk, total, totalHalaman, daftarKategori, galat } = await ambilProduk(
    q,
    kategoriDipilih,
    urutan,
    halaman
  );

  function buatUrlHalaman(halamanTujuan) {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (kategoriDipilih) sp.set("kategori", kategoriDipilih);
    if (urutan && urutan !== "terbaru") sp.set("urutan", urutan);
    if (halamanTujuan > 1) sp.set("halaman", String(halamanTujuan));
    const qs = sp.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>
          {total > 0 && (
            <p className="text-sm text-teks-lembut">
              Menampilkan {daftarProduk.length} dari {total} produk
            </p>
          )}
        </div>

        <form
          method="GET"
          action="/"
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-garis bg-permukaan p-4"
        >
          <div className="min-w-[180px] flex-1">
            <Input
              label="Cari produk"
              name="q"
              type="search"
              placeholder="Cari berdasarkan nama..."
              defaultValue={q}
            />
          </div>

          <div className="w-full sm:w-44">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Kategori
              <select
                name="kategori"
                defaultValue={kategoriDipilih}
                className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
              >
                <option value="">Semua kategori</option>
                {daftarKategori.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="w-full sm:w-44">
            <label className="flex flex-col gap-1.5 text-sm font-semibold">
              Urutkan
              <select
                name="urutan"
                defaultValue={urutan}
                className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Termurah</option>
                <option value="termahal">Termahal</option>
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <Tombol type="submit">Terapkan</Tombol>
            {adaFilter && (
              <Tombol href="/" varian="garis">
                Atur ulang
              </Tombol>
            )}
          </div>
        </form>

        {galat ? (
          <p role="alert" className="rounded-lg border border-bahaya px-3 py-2 text-sm text-bahaya">
            Gagal memuat produk: {galat}. Silakan muat ulang halaman atau coba lagi nanti.
          </p>
        ) : daftarProduk.length === 0 ? (
          adaFilter ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-teks-lembut">Produk tidak ditemukan</p>
              <Tombol href="/" varian="garis">
                Atur ulang
              </Tombol>
            </div>
          ) : (
            <p className="text-teks-lembut">Belum ada produk</p>
          )
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            {totalHalaman > 1 && (
              <nav aria-label="Navigasi halaman produk" className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {halaman > 1 ? (
                  <Tombol href={buatUrlHalaman(halaman - 1)} varian="garis">
                    Sebelumnya
                  </Tombol>
                ) : (
                  <Tombol disabled varian="garis" className="opacity-40 cursor-not-allowed">
                    Sebelumnya
                  </Tombol>
                )}

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalHalaman }, (_, i) => i + 1).map((noHalaman) => (
                    <Tombol
                      key={noHalaman}
                      href={buatUrlHalaman(noHalaman)}
                      varian={noHalaman === halaman ? "utama" : "garis"}
                      className="h-10 w-10 p-0"
                      aria-current={noHalaman === halaman ? "page" : undefined}
                    >
                      {noHalaman}
                    </Tombol>
                  ))}
                </div>

                {halaman < totalHalaman ? (
                  <Tombol href={buatUrlHalaman(halaman + 1)} varian="garis">
                    Selanjutnya
                  </Tombol>
                ) : (
                  <Tombol disabled varian="garis" className="opacity-40 cursor-not-allowed">
                    Selanjutnya
                  </Tombol>
                )}
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
