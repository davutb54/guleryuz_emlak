"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, MapPin, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/navigation";

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

export default function HomeHero() {
  const t = useTranslations("hero");
  const s = useTranslations("search");
  const router = useRouter();

  const [listingType, setListingType] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (listingType) params.set("tur", listingType);
    if (category) params.set("kategori", category);
    if (location.trim()) params.set("ilce", location.trim());
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
        {/* Overline */}
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          ✦ {t("overline")} ✦
        </p>

        {/* Başlık */}
        <h1 className="text-balance font-display text-display-xl text-cream-50 md:text-display-2xl">
          {t("headline")}{" "}
          <em className="not-italic text-gold-500">{t("headlineAccent")}</em>
        </h1>

        {/* Alt başlık */}
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream-300 md:text-lg">
          {t("sub")}
        </p>

        {/* Altın çizgi dekorasyon */}
        <div
          className="mx-auto mt-8 h-px w-16"
          style={{ background: "var(--color-gold-500)" }}
        />
      </div>

      {/* Arama çubuğu */}
      <div className="mt-12 w-full max-w-5xl animate-fade-up">
        <div className="glass rounded-2xl p-2 md:rounded-[20px]">
          <div className="grid grid-cols-1 gap-1 md:grid-cols-[1fr_auto_auto_auto_auto]">
            {/* Konum */}
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/5">
              <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-gold-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={s("location")}
                className="w-full bg-transparent text-sm text-cream-100 placeholder:text-silver-500 focus:outline-none"
              />
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
