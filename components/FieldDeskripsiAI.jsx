"use client";

import { useState } from "react";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FieldDeskripsiAI({ defaultValue = "" }) {
  const [deskripsi, setDeskripsi] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState("");

  async function handleBuatDeskripsi(e) {
    e.preventDefault();
    setPesanError("");

    const form = e.currentTarget.closest("form");
    const nama = form?.elements?.nama?.value?.trim() || "";
    const kategori = form?.elements?.kategori?.value?.trim() || "";

    if (!nama) {
      setPesanError("Isi nama produk terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const res = await buatDeskripsiAI(nama, kategori);
      if (res?.sukses) {
        setDeskripsi(res.deskripsi);
      } else {
        setPesanError(res?.error || "Gagal membuat deskripsi.");
      }
    } catch (err) {
      setPesanError(err?.message || "Terjadi kesalahan saat memanggil AI.");
    } finally {
      setLoading(false);
    }
  }

  const kelas =
    "w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="field-deskripsi" className="text-sm font-semibold">
          Deskripsi
        </label>
        <button
          type="button"
          onClick={handleBuatDeskripsi}
          disabled={loading}
          className="text-xs font-semibold text-utama underline underline-offset-2 hover:text-utama-gelap disabled:opacity-50"
        >
          {loading ? "Sedang membuat..." : "Buat deskripsi dengan AI"}
        </button>
      </div>

      <textarea
        id="field-deskripsi"
        name="deskripsi"
        rows={4}
        className={kelas}
        value={deskripsi}
        onChange={(e) => setDeskripsi(e.target.value)}
        placeholder="Tulis deskripsi produk atau gunakan AI untuk membuat otomatis..."
      />

      {pesanError && (
        <p role="alert" className="text-xs text-bahaya">
          {pesanError}
        </p>
      )}
    </div>
  );
}
