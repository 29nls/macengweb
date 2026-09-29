import { Skeleton, Box } from "@mui/material";
import { Code, Award, RefreshCw, CloudOff } from "lucide-react";

/**
 * State UI untuk panel Projects & Certificates di Portofolio.
 * Skeleton ditampilkan saat data sedang diambil, error state saat fetch
 * gagal (mis. kredensial Supabase belum diisi), dan empty state saat
 * fetch sukses tapi tidak ada data.
 */

function PanelHeading({ icon, title, message }) {
  return (
    <div className="text-center py-2">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto">{message}</p>
    </div>
  );
}

function RetryButton({ onRetry }) {
  if (!onRetry) return null;
  return (
    <div className="flex justify-center mt-5">
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        <RefreshCw className="w-4 h-4" />
        Coba Lagi
      </button>
    </div>
  );
}

export function PortfolioSkeleton({ variant = "projects" }) {
  const isCertificates = variant === "certificates";
  return (
    <Box sx={{ width: "100%" }} role="status" aria-label="Memuat data...">
      <div
        className={`container mx-auto flex justify-center items-center overflow-hidden ${
          isCertificates ? "pb-[5%]" : ""
        }`}
      >
        <div
          className={`grid gap-5 w-full ${
            isCertificates
              ? "grid-cols-1 md:grid-cols-3 md:gap-5 gap-4"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3"
          }`}
        >
          {Array.from({ length: isCertificates ? 3 : 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10 p-5"
            >
              <Skeleton
                variant="rounded"
                sx={{
                  width: "100%",
                  height: 0,
                  paddingBottom: isCertificates ? "71%" : "50%",
                  borderRadius: "0.5rem",
                  bgcolor: "rgba(148, 163, 184, 0.12)",
                }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: "1.25rem", mt: 2, width: "70%", bgcolor: "rgba(148, 163, 184, 0.12)" }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: "0.875rem", width: "90%", bgcolor: "rgba(148, 163, 184, 0.12)" }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: "0.875rem", width: "45%", bgcolor: "rgba(148, 163, 184, 0.12)" }}
              />
            </div>
          ))}
        </div>
      </div>
    </Box>
  );
}

export function PortfolioEmpty({ variant = "projects" }) {
  const isCertificates = variant === "certificates";
  return (
    <div className="container mx-auto flex justify-center items-center py-12">
      <PanelHeading
        icon={
          isCertificates ? (
            <Award className="w-7 h-7 text-purple-400" />
          ) : (
            <Code className="w-7 h-7 text-blue-400" />
          )
        }
        title={isCertificates ? "Belum Ada Sertifikat" : "Belum Ada Proyek"}
        message={
          isCertificates
            ? "Sertifikat akan ditampilkan di sini begitu tersedia. Silakan cek kembali nanti."
            : "Proyek akan ditampilkan di sini begitu tersedia. Silakan cek kembali nanti."
        }
      />
    </div>
  );
}

export function PortfolioError({ variant = "projects", onRetry }) {
  const isCertificates = variant === "certificates";
  return (
    <div className="container mx-auto flex justify-center items-center py-12">
      <div className="text-center">
        <PanelHeading
          icon={<CloudOff className="w-7 h-7 text-red-400" />}
          title={isCertificates ? "Gagal Memuat Sertifikat" : "Gagal Memuat Proyek"}
          message="Terjadi kendala saat mengambil data. Periksa koneksi internet Anda lalu coba lagi."
        />
        <RetryButton onRetry={onRetry} />
      </div>
    </div>
  );
}
