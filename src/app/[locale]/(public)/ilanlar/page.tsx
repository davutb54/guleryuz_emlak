import { db } from "@/lib/db";
import { listingFilterSchema } from "@/lib/validations/listing";
import ListingCard from "@/components/listing/listing-card";
import SortSelect from "@/components/listing/sort-select";
import { ESKISEHIR_DISTRICTS } from "@/lib/data/eskisehir";
import { Link } from "@/i18n/navigation";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

// Sayfalama için toplam sayı
const ITEMS_PER_PAGE = 12;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(params: Record<string, string | string[] | undefined>, key: string): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

export default async function IlanlarPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;

  // Filtre parametrelerini parse et
  const filters = listingFilterSchema.parse({
    category: getParam(rawParams, "kategori"),
    type: getParam(rawParams, "tur"),
    district: getParam(rawParams, "ilce"),
    rooms: getParam(rawParams, "oda"),
    minPrice: getParam(rawParams, "minFiyat"),
    maxPrice: getParam(rawParams, "maxFiyat"),
    minArea: getParam(rawParams, "minAlan"),
    maxArea: getParam(rawParams, "maxAlan"),
    page: getParam(rawParams, "sayfa"),
    sort: getParam(rawParams, "siralama"),
  });

  // Prisma where koşulu
  const where = {
    status: "ACTIVE" as const,
    ...(filters.category && { category: filters.category }),
    ...(filters.type && { type: filters.type }),
    ...(filters.district && { district: filters.district }),
    ...(filters.rooms && { rooms: filters.rooms }),
    ...(filters.minPrice || filters.maxPrice
      ? {
          price: {
            ...(filters.minPrice && { gte: filters.minPrice }),
            ...(filters.maxPrice && { lte: filters.maxPrice }),
          },
        }
      : {}),
    ...(filters.minArea || filters.maxArea
      ? {
          area: {
            ...(filters.minArea && { gte: filters.minArea }),
            ...(filters.maxArea && { lte: filters.maxArea }),
          },
        }
      : {}),
  };

  // Sıralama
  const orderBy = {
    newest: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    area_asc: { area: "asc" as const },
    area_desc: { area: "desc" as const },
  }[filters.sort];

  const skip = (filters.page - 1) * ITEMS_PER_PAGE;

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        titleTr: true,
        price: true,
        currency: true,
        district: true,
        category: true,
        type: true,
        area: true,
        rooms: true,
        bathrooms: true,
        featured: true,
        images: {
          where: { isPrimary: true },
          select: { url: true, isPrimary: true, alt: true },
          take: 1,
        },
      },
    }),
    db.listing.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Filtre URL helper
  function buildUrl(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    const mapping: Record<string, string> = {
      category: "kategori",
      type: "tur",
      district: "ilce",
      rooms: "oda",
      minPrice: "minFiyat",
      maxPrice: "maxFiyat",
      sort: "siralama",
    };
    const current = {
      kategori: getParam(rawParams, "kategori"),
      tur: getParam(rawParams, "tur"),
      ilce: getParam(rawParams, "ilce"),
      oda: getParam(rawParams, "oda"),
      minFiyat: getParam(rawParams, "minFiyat"),
      maxFiyat: getParam(rawParams, "maxFiyat"),
      siralama: getParam(rawParams, "siralama"),
      ...overrides,
    };
    Object.entries(current).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return `/ilanlar?${p.toString()}`;
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-16">
        {/* Başlık */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-2">
            Güleryüz Gayrimenkul
          </p>
          <h1 className="font-display text-display-lg text-cream-50">İlanlar</h1>
          <p className="text-silver-500 mt-2">
            {total} ilan bulundu
          </p>
        </div>

        <div className="flex gap-8">
          {/* ─── Sol: Filtre Paneli ─────────────────────────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <form method="GET" action="/ilanlar">
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5 space-y-5 sticky top-24">
                <div className="flex items-center gap-2 text-silver-300 text-sm font-semibold">
                  <SlidersHorizontal size={15} strokeWidth={1.5} className="text-gold-500" />
                  Filtrele
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-silver-400 uppercase tracking-wider mb-2">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    defaultValue={getParam(rawParams, "kategori") ?? ""}
                    className="w-full bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  >
                    <option value="">Tümü</option>
                    <option value="HOUSE">Ev / Daire</option>
                    <option value="LAND">Arsa</option>
                    <option value="FIELD">Tarla</option>
                    <option value="SHOP">Dükkan</option>
                  </select>
                </div>

                {/* Tür */}
                <div>
                  <label className="block text-xs font-semibold text-silver-400 uppercase tracking-wider mb-2">
                    Tür
                  </label>
                  <select
                    name="tur"
                    defaultValue={getParam(rawParams, "tur") ?? ""}
                    className="w-full bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  >
                    <option value="">Tümü</option>
                    <option value="SALE">Satılık</option>
                    <option value="RENT">Kiralık</option>
                  </select>
                </div>

                {/* İlçe */}
                <div>
                  <label className="block text-xs font-semibold text-silver-400 uppercase tracking-wider mb-2">
                    İlçe
                  </label>
                  <select
                    name="ilce"
                    defaultValue={getParam(rawParams, "ilce") ?? ""}
                    className="w-full bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  >
                    <option value="">Tümü</option>
                    {ESKISEHIR_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fiyat */}
                <div>
                  <label className="block text-xs font-semibold text-silver-400 uppercase tracking-wider mb-2">
                    Fiyat (₺)
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="minFiyat"
                      type="number"
                      min={0}
                      placeholder="Min"
                      defaultValue={getParam(rawParams, "minFiyat") ?? ""}
                      className="w-full bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600"
                    />
                    <input
                      name="maxFiyat"
                      type="number"
                      min={0}
                      placeholder="Max"
                      defaultValue={getParam(rawParams, "maxFiyat") ?? ""}
                      className="w-full bg-navy-800 border border-[var(--border-subtle)] text-cream-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gold-500 placeholder:text-navy-600"
                    />
                  </div>
                </div>

                {/* Butonlar */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
                  >
                    Ara
                  </button>
                  <Link
                    href="/ilanlar"
                    className="px-3 py-2.5 rounded-lg border border-[var(--border-subtle)] text-silver-400 text-sm hover:text-cream-100 hover:border-silver-400 transition-colors"
                  >
                    Sıfırla
                  </Link>
                </div>
              </div>
            </form>
          </aside>

          {/* ─── Sağ: Sonuçlar ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Sıralama */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-silver-500 text-sm">
                {skip + 1}–{Math.min(skip + ITEMS_PER_PAGE, total)} / {total} ilan
              </p>
              <SortSelect
                defaultValue={getParam(rawParams, "siralama") ?? "newest"}
                hiddenFields={["kategori", "tur", "ilce", "minFiyat", "maxFiyat"]
                  .filter((k) => !!getParam(rawParams, k))
                  .map((k) => ({ name: k, value: getParam(rawParams, k)! }))}
              />
            </div>

            {/* İlan ızgarası */}
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-silver-500 text-lg mb-2">Uygun ilan bulunamadı</p>
                <Link
                  href="/ilanlar"
                  className="mt-4 px-4 py-2 rounded-full border border-gold-500/40 text-gold-500 text-sm hover:bg-gold-500/8 transition-colors"
                >
                  Filtreleri Temizle
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {filters.page > 1 && (
                  <Link
                    href={buildUrl({ sayfa: String(filters.page - 1) })}
                    className="p-2 rounded-lg border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100 hover:border-silver-400 transition-colors"
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                  </Link>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - filters.page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={buildUrl({ sayfa: String(p) })}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === filters.page
                          ? "bg-gold-500 text-navy-900"
                          : "border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100 hover:border-silver-400"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}

                {filters.page < totalPages && (
                  <Link
                    href={buildUrl({ sayfa: String(filters.page + 1) })}
                    className="p-2 rounded-lg border border-[var(--border-subtle)] text-silver-400 hover:text-cream-100 hover:border-silver-400 transition-colors"
                  >
                    <ChevronRight size={18} strokeWidth={1.5} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
