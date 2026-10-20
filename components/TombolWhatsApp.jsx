"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  const totalHarga = (produk?.harga || 0) * jumlah;
  const pesan = `Halo, saya mau pesan ${produk.nama} x${jumlah} (${formatRupiah(totalHarga)}).`;
  const href = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Jumlah
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
            disabled={jumlah <= 1}
            aria-label="Kurangi jumlah"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-semibold text-teks hover:bg-permukaan disabled:opacity-40"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="99"
            value={jumlah}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (isNaN(val)) setJumlah(1);
              else setJumlah(Math.min(99, Math.max(1, val)));
            }}
            className="h-10 w-16 rounded-lg border border-garis bg-latar text-center text-base font-semibold text-teks focus:border-utama focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setJumlah((prev) => Math.min(99, prev + 1))}
            disabled={jumlah >= 99}
            aria-label="Tambah jumlah"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-garis bg-latar text-lg font-semibold text-teks hover:bg-permukaan disabled:opacity-40"
          >
            +
          </button>
        </div>
      </label>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
