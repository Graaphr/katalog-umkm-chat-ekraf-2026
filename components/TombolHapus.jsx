"use client";

import Tombol from "@/components/Tombol";
import { hapusProduk } from "@/app/admin/actions";

export default function TombolHapus({ id, action }) {
  function handleSubmit(e) {
    if (!confirm("Hapus produk ini?")) {
      e.preventDefault();
    }
  }

  const formAction = action || hapusProduk.bind(null, id);

  return (
    <form action={formAction} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="id" value={id} />
      <Tombol type="submit" varian="bahaya">
        Hapus
      </Tombol>
    </form>
  );
}

