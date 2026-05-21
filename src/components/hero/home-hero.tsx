"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, ChevronDown, ChevronRight, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

const LISTING_TYPES = [
  { value: "", labelKey: "allTypes" },
  { value: "SALE", labelKey: "sale" },
  { value: "RENT", labelKey: "rent" },
] as const;

const CATEGORIES = [
  { value: "", labelKey: "allCategories" },
  { value: "HOUSE", labelKey: "house" },
  { value: "LAND", labelKey: "land" },
  { value: "FIELD", labelKey: "field" },
  { value: "SHOP", labelKey: "shop" },
] as const;

type SearchResult = {
  slug: string;
  titleTr: string;
  district: string;
  type: string;
  category: string;
  price: number;
  currency: string;
  images: { url: string }[];
};

function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString("tr-TR")} ${currency === "TRY" ? "₺" : currency}`;
}

export default function HomeHero() {
  const t = useTranslations("hero");
  const s = useTranslations("search");
  const router = useRouter();

  const [listingType, setListingType] = useState("");
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce + fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (listingType) params.set("type", listingType);
        if (category) params.set("category", category);
        const res = await fetch(`/api/listings/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
          setTotal(data.total);
          setOpen(true);
        }
      } catch {
        // sessiz hata
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, listingType, category]);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleSearch() {
    setOpen(false);
    const params = new URLSearchParams();
    if (listingType) params.set("tur", listingType);
    if (category) params.set("kategori", category);
    if (query.trim()) params.set("ara", query.trim());
    const qs = params.toString();
    router.push(qs ? `/ilanlar?${qs}` : "/ilanlar");
  }

  return (
    <section className="relative flex min-h-[calc(100vh-80px)] flex-col items-center justify-center overflow-hidden px-5 py-20 md:px-8 lg:px-16">
      {/* Arka plan gradyanı */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #142540 0%, #0A1628 55%, #050E1F 100%)",
        }}
      />
      {/* Dekoratif ışık noktası */}
      <div
        className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #D4A744 0%, transparent 70%)" }}
      />

      {/* İçerik */}
      <div className="w-full max-w-4xl text-center animate-fade-up">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          ✦ {t("overline")} ✦
        </p>
        <h1 className="text-balance font-display text-display-xl text-cream-50 md:text-display-2xl">
          {t("headline")}{" "}
          <em className="not-italic text-gold-500">{t("headlineAccent")}</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream-300 md:text-lg">
          {t("sub")}
        </p>
        <div
          className="mx-auto mt-8 h-px w-16"
          style={{ background: "var(--color-gold-500)" }}
        />
      </div>

      {/* Arama çubuğu */}
      <div className="mt-12 w-full max-w-5xl animate-fade-up relative" ref={containerRef}>
        <div className="glass rounded-2xl p-2 md:rounded-[20px]">
          <div className="grid grid-cols-1 gap-1 md:grid-cols-[1fr_auto_auto_auto_auto]">
            {/* Arama kutusu */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/5">
              <Search
                size={16}
                strokeWidth={1.5}
                className={cn(
                  "shrink-0 transition-colors",
                  loading ? "text-silver-400 animate-pulse" : "text-gold-500"
                )}
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                  if (e.key === "Escape") setOpen(false);
                }}
                placeholder="İlan başlığı, açıklama veya ilçe ara..."
                className="w-full bg-transparent text-sm text-cream-100 placeholder:text-silver-500 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setOpen(false); }}
                  className="shrink-0 text-silver-500 hover:text-silver-300 transition-colors text-xs leading-none"
                  aria-label="Temizle"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="hidden h-8 w-px self-center bg-[--border-divider] md:block" />

            {/* İlan türü */}
            <div className="relative flex items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-white/5">
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full appearance-none bg-transparent text-sm text-cream-100 focus:outline-none cursor-pointer"
              >
                {LISTING_TYPES.map(({ value, labelKey }) => (
                  <option key={value} value={value} className="bg-navy-800 text-cream-100">
                    {s(labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="shrink-0 text-silver-500 pointer-events-none" />
            </div>

            <div className="hidden h-8 w-px self-center bg-[--border-divider] md:block" />

            {/* Mülk tipi */}
            <div className="relative flex items-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-white/5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full appearance-none bg-transparent text-sm text-cream-100 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map(({ value, labelKey }) => (
                  <option key={value} value={value} className="bg-navy-800 text-cream-100">
                    {s(labelKey)}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="shrink-0 text-silver-500 pointer-events-none" />
            </div>

            {/* Ara butonu */}
            <button
              onClick={handleSearch}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-6 py-3",
                "bg-gold-500 text-sm font-semibold text-navy-900",
                "transition-all duration-200 hover:bg-gold-400 hover:-translate-y-px",
                "shadow-glow-sm"
              )}
            >
              <Search size={16} />
              <span>{s("search")}</span>
            </button>
          </div>
        </div>

        {/* Dropdown sonuçlar */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-navy-800 border border-[rgba(212,167,68,0.2)] shadow-2xl overflow-hidden z-50">
            {results.length === 0 ? (
              <div className="px-4 py-5 text-center text-sm text-silver-500">
                &ldquo;{query}&rdquo; için sonuç bulunamadı
              </div>
            ) : (
              <>
                {results.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/ilan/${r.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-navy-700 transition-colors group border-b border-[rgba(255,255,255,0.04)] last:border-0"
                  >
                    {/* Küçük önizleme */}
                    <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-navy-700 shrink-0">
                      {r.images[0] ? (
                        <Image
                          src={r.images[0].url}
                          alt={r.titleTr}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 size={16} className="text-navy-500" />
                        </div>
                      )}
                    </div>

                    {/* Başlık + konum */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-cream-100 truncate group-hover:text-gold-400 transition-colors">
                        {r.titleTr}
                      </p>
                      <p className="text-xs text-silver-500 mt-0.5">{r.district}</p>
                    </div>

                    {/* Fiyat */}
                    <p className="text-xs font-semibold text-gold-500 tabular-nums shrink-0">
                      {formatPrice(r.price, r.currency)}
                    </p>

                    <ChevronRight size={14} className="text-silver-600 shrink-0 group-hover:text-gold-500 transition-colors" />
                  </Link>
                ))}

                {/* Tüm sonuçlar */}
                <button
                  onClick={handleSearch}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gold-500 hover:text-gold-400 hover:bg-navy-700/60 transition-colors border-t border-[rgba(212,167,68,0.12)]"
                >
                  <span>
                    {total > 5
                      ? `Tümünü gör — ${total} ilan`
                      : `${total} sonucu listele`}
                  </span>
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* İstatistik bantı */}
      <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-4 animate-fade-up">
        {[
          { value: "500+", label: "Aktif İlan" },
          { value: "12+", label: "Yıllık Deneyim" },
          { value: "1200+", label: "Mutlu Müşteri" },
        ].map(({ value, label }) => (
          <div key={label} className="text-center">
            <p className="font-display text-2xl font-bold text-gold-500 tabular-nums">
              {value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-silver-500">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
