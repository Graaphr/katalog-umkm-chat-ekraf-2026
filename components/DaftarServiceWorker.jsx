"use client";

import { useEffect } from "react";

export default function DaftarServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Gagal mendaftarkan service worker (misal di lingkungan non-HTTPS atau unsupported)
      });
    }
  }, []);

  return null;
}

