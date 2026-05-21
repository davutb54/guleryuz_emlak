import { Link } from "@/i18n/navigation";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-navy-900 flex items-center justify-center px-5">
      {/* Arka plan dekor */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, #142540 0%, #0A1628 60%, #050E1F 100%)",
        }}
      />

      <div className="text-center max-w-lg">
        {/* 404 numara */}
        <p className="font-display text-[8rem] md:text-[10rem] font-bold leading-none tabular-nums text-transparent"
          style={{
            WebkitTextStroke: "2px rgba(212,167,68,0.3)",
          }}
        >
          404
        </p>

        {/* Altın çizgi */}
        <div className="mx-auto mb-6 h-px w-16 bg-gold-500 opacity-60" />

        {/* Başlık */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600 mb-3">
          Sayfa Bulunamadı
        </p>
        <h1 className="font-display text-display-md text-cream-50 mb-4">
          Aradığınız Sayfa Mevcut Değil
        </h1>
        <p className="text-silver-400 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Bu sayfa kaldırılmış, taşınmış veya hiç var olmamış olabilir.
          Lütfen adres çubuğunu kontrol edin ya da aşağıdaki bağlantıları kullanın.
        </p>

        {/* Aksiyon butonları */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors"
          >
            <Home size={16} strokeWidth={1.5} />
            Ana Sayfaya Dön
          </Link>
          <Link
            href="/ilanlar"
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-gold-500/40 text-gold-500 font-medium text-sm hover:bg-gold-500/8 transition-colors"
          >
            <Search size={16} strokeWidth={1.5} />
            İlanları Gör
          </Link>
        </div>
      </div>
    </div>
  );
}
