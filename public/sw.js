// Service worker minimal untuk pemenuhan syarat PWA.
// Tidak men-cache apa pun (termasuk /admin atau data produk) agar data selalu up to date.
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Selalu mengambil langsung dari jaringan
  event.respondWith(fetch(event.request));
});

