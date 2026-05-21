// Saf util fonksiyonlar — "use client" YOK, hem Server hem Client kullanabilir

import { LISTING_CATEGORIES, LISTING_TYPES } from "@/lib/validations/listing";

export type FilterState = {
  q?: string;
  category?: (typeof LISTING_CATEGORIES)[number];
  type?: (typeof LISTING_TYPES)[number];
  districts: string[];
  neighborhoods: string[];   // mahalle — tek ilçe seçiliyken aktif
  rooms: string[];
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  heating?: string;
  zoningStatus?: string;
  hasBalcony?: boolean;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasSecurity?: boolean;
  hasPool?: boolean;
  inSite?: boolean;
  furnished?: boolean;
  sort: string;
  page: number;
};

export const EMPTY_FILTER: FilterState = {
  districts: [],
  neighborhoods: [],
  rooms: [],
  sort: "newest",
  page: 1,
};

// URLSearchParams → FilterState
export function parseFiltersFromUrl(params: URLSearchParams): FilterState {
  const get = (key: string) => params.get(key) ?? undefined;
  const getAll = (key: string) => params.getAll(key).filter(Boolean);
  const getBool = (key: string): boolean | undefined => {
    const v = get(key);
    return v === undefined ? undefined : v === "true";
  };
  const getNum = (key: string): number | undefined => {
    const v = get(key);
    if (!v) return undefined;
    const n = Number(v);
    return isNaN(n) ? undefined : n;
  };

  const rawCategory = get("kategori");
  const rawType = get("tur");

  return {
    q: get("ara") || undefined,
    category: LISTING_CATEGORIES.includes(rawCategory as never)
      ? (rawCategory as FilterState["category"])
      : undefined,
    type: LISTING_TYPES.includes(rawType as never)
      ? (rawType as FilterState["type"])
      : undefined,
    districts: getAll("ilce"),
    neighborhoods: getAll("mahalle"),
    rooms: getAll("oda"),
    minPrice: getNum("minFiyat"),
    maxPrice: getNum("maxFiyat"),
    minArea: getNum("minAlan"),
    maxArea: getNum("maxAlan"),
    heating: get("isitma"),
    zoningStatus: get("imar"),
    hasBalcony: getBool("balkon"),
    hasElevator: getBool("asansor"),
    hasParking: getBool("otopark"),
    hasSecurity: getBool("guvenlik"),
    hasPool: getBool("havuz"),
    inSite: getBool("site"),
    furnished: getBool("esyali"),
    sort: get("siralama") ?? "newest",
    page: Number(get("sayfa")) || 1,
  };
}

// FilterState → URL string
export function buildFilterUrl(
  state: Partial<FilterState>,
  base = "/ilanlar"
): string {
  const p = new URLSearchParams();

  if (state.q) p.set("ara", state.q);
  if (state.category) p.set("kategori", state.category);
  if (state.type) p.set("tur", state.type);
  (state.districts ?? []).forEach((d) => p.append("ilce", d));
  (state.neighborhoods ?? []).forEach((n) => p.append("mahalle", n));
  (state.rooms ?? []).forEach((r) => p.append("oda", r));
  if (state.minPrice != null) p.set("minFiyat", String(state.minPrice));
  if (state.maxPrice != null) p.set("maxFiyat", String(state.maxPrice));
  if (state.minArea != null) p.set("minAlan", String(state.minArea));
  if (state.maxArea != null) p.set("maxAlan", String(state.maxArea));
  if (state.heating) p.set("isitma", state.heating);
  if (state.zoningStatus) p.set("imar", state.zoningStatus);
  if (state.hasBalcony) p.set("balkon", "true");
  if (state.hasElevator) p.set("asansor", "true");
  if (state.hasParking) p.set("otopark", "true");
  if (state.hasSecurity) p.set("guvenlik", "true");
  if (state.hasPool) p.set("havuz", "true");
  if (state.inSite) p.set("site", "true");
  if (state.furnished) p.set("esyali", "true");
  if (state.sort && state.sort !== "newest") p.set("siralama", state.sort);
  if (state.page && state.page > 1) p.set("sayfa", String(state.page));

  const qs = p.toString();
  return qs ? `${base}?${qs}` : base;
}

// Aktif filtre sayısı (sayfa/sıralama hariç — mobile badge için)
export function countActiveFilters(state: Partial<FilterState>): number {
  let count = 0;
  if (state.q) count++;
  if (state.category) count++;
  if (state.type) count++;
  if ((state.districts ?? []).length) count++;
  if ((state.neighborhoods ?? []).length) count++;
  if ((state.rooms ?? []).length) count++;
  if (state.minPrice != null || state.maxPrice != null) count++;
  if (state.minArea != null || state.maxArea != null) count++;
  if (state.heating) count++;
  if (state.zoningStatus) count++;
  if (state.hasBalcony) count++;
  if (state.hasElevator) count++;
  if (state.hasParking) count++;
  if (state.hasSecurity) count++;
  if (state.hasPool) count++;
  if (state.inSite) count++;
  if (state.furnished) count++;
  return count;
}
