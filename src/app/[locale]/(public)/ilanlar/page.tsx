import { db } from "@/lib/db";
import ListingCard from "@/components/listing/listing-card";
import SortSelect from "@/components/listing/sort-select";
import FilterSheet from "@/components/listing/filter-sheet";
import ViewToggle from "@/components/listing/view-toggle";
import ListingMapClient from "@/components/listing/listing-map-client";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { parseFiltersFromUrl, buildFilterUrl } from "@/lib/filter-utils";
import type { MapListing } from "@/components/listing/listing-map";

const ITEMS_PER_PAGE = 12;
const MAP_MAX_LISTINGS = 200;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const val = params[key];
  return Array.isArray(val) ? val[0] : val;
}

function toURLSearchParams(
  raw: Record<string, string | string[] | undefined>
): URLSearchParams {
  const p = new URLSearchParams();
  for (const [key, val] of Object.entries(raw)) {
    if (!val) continue;
    if (Array.isArray(val)) val.forEach((v) => p.append(key, v));
    else p.set(key, val);
  }
  return p;
}

export default async function IlanlarPage({ searchParams }: PageProps) {
  const rawParams = await searchParams;
  const filters = parseFiltersFromUrl(toURLSearchParams(rawParams));
  const isMapView = getParam(rawParams, "gorunum") === "harita";

  // ─── Prisma where koşulu ─────────────────────────────────────────────────
  const where: Record<string, unknown> = { status: "ACTIVE" };

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;

  if (filters.districts && filters.districts.length > 0) {
    where.district = { in: filters.districts };
  }
  if (filters.neighborhoods && filters.neighborhoods.length > 0) {
    where.neighborhood = { in: filters.neighborhoods };
  }
  if (filters.rooms && filters.rooms.length > 0) {
    where.rooms = { in: filters.rooms };
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {
      ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.minArea != null || filters.maxArea != null) {
    where.area = {
      ...(filters.minArea != null ? { gte: filters.minArea } : {}),
      ...(filters.maxArea != null ? { lte: filters.maxArea } : {}),
    };
  }

  if (filters.hasBalcony) where.hasBalcony = true;
  if (filters.hasElevator) where.hasElevator = true;
  if (filters.hasParking) where.hasParking = true;
  if (filters.hasSecurity) where.hasSecurity = true;
  if (filters.hasPool) where.hasPool = true;
  if (filters.inSite) where.inSite = true;
  if (filters.furnished) where.furnished = true;

  if (filters.heating) where.heating = filters.heating;
  if (filters.zoningStatus) where.zoningStatus = filters.zoningStatus;

  // ─── Sıralama ────────────────────────────────────────────────────────────
  const orderBy = {
    newest: { createdAt: "desc" as const },
    oldest: { createdAt: "asc" as const },
    price_asc: { price: "asc" as const },
    price_desc: { price: "desc" as const },
    area_asc: { area: "asc" as const },
    area_desc: { area: "desc" as const },
  }[filters.sort] ?? { createdAt: "desc" as const };

  // ─── View-toggle URL'leri (gorunum + sayfa olmadan) ──────────────────────
  const filterOnlyUrl = buildFilterUrl({ ...filters, page: 1 });
  const listUrl = filterOnlyUrl;
  const mapUrl =
    filterOnlyUrl === "/ilanlar"
      ? "/ilanlar?gorunum=harita"
      : `${filterOnlyUrl}&gorunum=harita`;

  // ─── SortSelect için mevcut params ───────────────────────────────────────
  const currentFilterParams = Object.entries(rawParams)
    .filter(([k]) => k !== "siralama" && k !== "sayfa" && k !== "gorunum")
    .flatMap(([k, v]) =>
      Array.isArray(v)
        ? v.map((val) => ({ name: k, value: val }))
        : v
        ? [{ name: k, value: v }]
        : []
    );

  // ─── Harita görünümü: koordinatlı tüm ilanlar (max 200) ─────────────────
  if (isMapView) {
    const mapListingsRaw = await db.listing.findMany({
      where: { ...where, latitude: { not: null }, longitude: { not: null } },
      orderBy,
      take: MAP_MAX_LISTINGS,
      select: {
        id: true,
        slug: true,
        titleTr: true,
        price: true,
        currency: true,
        district: true,
        neighborhood: true,
        latitude: true,
        longitude: true,
        images: {
          where: { isPrimary: true },
          select: { url: true, alt: true },
          take: 1,
        },
      },
    });

    // Decimal → number (Client Component sınırı için)
    const mapListings: MapListing[] = mapListingsRaw.map((l) => ({
      ...l,
      price: l.price.toNumber(),
    }));

    const total = await db.listing.count({ where });

    return (
      <div className="min-h-screen bg-navy-900 pt-8 pb-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-16">
          {/* Başlık */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-2">
                Güleryüz Gayrimenkul
              </p>
              <h1 className="font-display text-display-lg text-cream-50">İlanlar</h1>
              <p className="text-silver-500 mt-2 text-sm">
                {total} ilan — {mapListings.length} konumlu
              </p>
            </div>
            <ViewToggle listUrl={listUrl} mapUrl={mapUrl} currentView="harita" />
          </div>

          {/* Mobile: filtre trigger */}
          <div className="flex items-center gap-3 mb-5 lg:hidden">
            <FilterSheet initialFilters={filters} />
          </div>

          <div className="flex gap-8">
            {/* Sol: Filtre Sidebar */}
            <FilterSheet initialFilters={filters} />

            {/* Sağ: Harita */}
            <div className="flex-1 min-w-0">
              <div className="rounded-xl overflow-hidden border border-[rgba(212,167,68,0.12)]" style={{ height: "calc(100vh - 14rem)" }}>
                <ListingMapClient listings={mapListings} />
              </div>
              {mapListings.length === 0 && (
                <p className="text-center text-silver-500 mt-8 text-sm">
                  Koordinatı olan ilan bulunamadı. İlan eklerken harita konumu belirtin.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Liste görünümü ───────────────────────────────────────────────────────
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

  function pageUrl(p: number) {
    return buildFilterUrl({ ...filters, page: p });
  }

  return (
    <div className="min-h-screen bg-navy-900 pt-8 pb-16">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-16">
        {/* Başlık */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-2">
              Güleryüz Gayrimenkul
            </p>
            <h1 className="font-display text-display-lg text-cream-50">İlanlar</h1>
            <p className="text-silver-500 mt-2 text-sm">{total} ilan bulundu</p>
          </div>
          <ViewToggle listUrl={listUrl} mapUrl={mapUrl} currentView="liste" />
        </div>

        {/* Mobile: filtre trigger */}
        <div className="flex items-center gap-3 mb-5 lg:hidden">
          <FilterSheet initialFilters={filters} />
          <div className="ml-auto">
            <SortSelect
              defaultValue={getParam(rawParams, "siralama") ?? "newest"}
              hiddenFields={currentFilterParams}
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sol: Filtre Sidebar */}
          <FilterSheet initialFilters={filters} />

          {/* Sağ: Sonuçlar */}
          <div className="flex-1 min-w-0">
            {/* Desktop: sıralama satırı */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <p className="text-silver-500 text-sm">
                {total === 0
                  ? "Sonuç bulunamadı"
                  : `${skip + 1}–${Math.min(skip + ITEMS_PER_PAGE, total)} / ${total} ilan`}
              </p>
              <SortSelect
                defaultValue={getParam(rawParams, "siralama") ?? "newest"}
                hiddenFields={currentFilterParams}
              />
            </div>

            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-silver-500 text-lg mb-2">Uygun ilan bulunamadı</p>
                <p className="text-silver-600 text-sm mb-6">
                  Farklı filtreler deneyin veya filtreleri temizleyin.
                </p>
                <Link
                  href="/ilanlar"
                  className="px-5 py-2.5 rounded-full border border-gold-500/40 text-gold-500 text-sm hover:bg-gold-500/8 transition-colors"
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
                    href={pageUrl(filters.page - 1)}
                    className="p-2 rounded-lg border border-[rgba(212,167,68,0.12)] text-silver-400 hover:text-cream-100 hover:border-silver-400 transition-colors"
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - filters.page) <= 2)
                  .map((p) => (
                    <Link
                      key={p}
                      href={pageUrl(p)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === filters.page
                          ? "bg-gold-500 text-navy-900"
                          : "border border-[rgba(212,167,68,0.12)] text-silver-400 hover:text-cream-100 hover:border-silver-400"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                {filters.page < totalPages && (
                  <Link
                    href={pageUrl(filters.page + 1)}
                    className="p-2 rounded-lg border border-[rgba(212,167,68,0.12)] text-silver-400 hover:text-cream-100 hover:border-silver-400 transition-colors"
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
