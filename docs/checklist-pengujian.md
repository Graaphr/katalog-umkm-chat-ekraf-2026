# Checklist Pengujian

Uji di link Vercel, bukan hanya di laptop. Coba juga di HP.

## Pengunjung

- [1] Katalog menampilkan semua produk dari database (bukan data contoh).
- [1] Harga tampil dalam format rupiah, misalnya Rp 45.000.
- [1] Klik kartu produk membuka halaman detail produk yang benar.
- [1] Alamat produk yang tidak ada (misalnya `/produk/9999`) menampilkan halaman "tidak ditemukan".
- [1] Tombol "Pesan via WhatsApp" membuka WhatsApp ke nomor toko dengan pesan berisi nama dan harga produk.
- [1] Tampilan rapi di HP: teks terbaca, tombol mudah ditekan, tidak ada yang terpotong.

## Admin

- [1] Login dengan email dan password yang benar berhasil masuk ke `/admin`.
- [1] Login dengan password salah menampilkan pesan error.
- [1] Ganti password berhasil, lalu login dengan password baru berhasil.
- [1] Password baru kurang dari 8 karakter atau tidak sama dengan konfirmasi ditolak dengan pesan yang jelas.
- [1] Tombol "Keluar" mengakhiri sesi.

## Bonus (jika dikerjakan)

- [1] Tambah produk: produk baru muncul di katalog.
- [1] Ubah produk: perubahan muncul di katalog.
- [1] Hapus produk: produk hilang dari katalog setelah konfirmasi.
