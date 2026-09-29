import { useEffect, useState } from "react";
import { supabase } from "../supabase";

/**
 * Menghitung jumlah proyek (yang dipublikasikan) dan sertifikat langsung
 * dari Supabase pakai count query (head: true) — hanya angka yang diambil,
 * bukan seluruh baris. Cache localStorage dipakai sebagai nilai awal agar
 * angka tidak "berkedip" dari 0 saat halaman dibuka, dan sebagai fallback
 * ketika jaringan gagal.
 */
export default function usePortfolioCounts() {
  const readCachedNumber = (key) => {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  };

  const [projectCount, setProjectCount] = useState(() => readCachedNumber("projects"));
  const [certificateCount, setCertificateCount] = useState(() =>
    readCachedNumber("certificates")
  );
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = async () => {
      try {
        const [projectsRes, certificatesRes] = await Promise.all([
          supabase
            .from("projects")
            .select("id", { count: "exact", head: true })
            .or("is_published.eq.true,is_published.is.null"),
          supabase
            .from("certificates")
            .select("id", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        if (projectsRes.error) throw projectsRes.error;
        if (certificatesRes.error) throw certificatesRes.error;

        setProjectCount(projectsRes.count ?? 0);
        setCertificateCount(certificatesRes.count ?? 0);
        setIsLive(true);
      } catch {
        // Fetch gagal (offline / kredensial placeholder): cache tetap dipakai.
        setIsLive(false);
      }
    };

    fetchCounts();

    const refreshFromCache = () => {
      setProjectCount(readCachedNumber("projects"));
      setCertificateCount(readCachedNumber("certificates"));
    };

    window.addEventListener("portfolioDataUpdated", refreshFromCache);
    // Sinkron antar-tab: tab lain yang memperbarui cache akan memicu event ini.
    window.addEventListener("storage", refreshFromCache);
    return () => {
      cancelled = true;
      window.removeEventListener("portfolioDataUpdated", refreshFromCache);
      window.removeEventListener("storage", refreshFromCache);
    };
  }, []);

  return { projectCount, certificateCount, isLive };
}
