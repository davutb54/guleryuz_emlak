import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — Sayfa Bulunamadı | Güleryüz Gayrimenkul",
};

export default function RootNotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, #142540 0%, #0A1628 60%, #050E1F 100%)" }}
    >
      <div className="text-center max-w-lg">
        <p
          className="font-display text-[8rem] md:text-[10rem] font-bold leading-none tabular-nums text-transparent"
          style={{ WebkitTextStroke: "2px rgba(212,167,68,0.3)" }}
        >
          404
        </p>

        <div className="mx-auto mb-6 h-px w-16 opacity-60" style={{ background: "#D4A744" }} />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: "#D4A744" }}>
          Sayfa Bulunamadı
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-playfair, serif)", color: "#F5F1E8" }}
        >
          Aradığınız Sayfa Mevcut Değil
        </h1>
        <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: "#9098A6" }}>
          Bu sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.
          Lütfen adres çubuğunu kontrol edin ya da aşağıdaki bağlantıları kullanın.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/tr"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
            style={{ background: "#D4A744", color: "#0A1628" }}
          >
            Ana Sayfaya Dön
          </a>
          <a
            href="/tr/ilanlar"
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
            style={{ border: "1px solid rgba(212,167,68,0.4)", color: "#D4A744" }}
          >
            İlanları Gör
          </a>
        </div>
      </div>
    </div>
  );
}
