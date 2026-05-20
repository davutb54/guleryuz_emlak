import { z } from "zod";

// ─── Enum sabitleri ───────────────────────────────────────────────────────────

export const LISTING_CATEGORIES = ["HOUSE", "LAND", "FIELD", "SHOP"] as const;
export const LISTING_TYPES = ["SALE", "RENT"] as const;
export const LISTING_STATUSES = [
  "DRAFT",
  "PENDING",
  "ACTIVE",
  "SOLD",
  "RENTED",
  "ARCHIVED",
] as const;

// ─── Yardımcı: form'dan gelen boş string/null → undefined dönüşümü ────────────

const optNum = (schema: z.ZodNumber = z.number()) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    schema.optional()
  );

const optStr = z
  .string()
  .transform((v) => (v.trim() === "" ? undefined : v.trim()))
  .optional();

// ─── Temel ilan oluşturma şeması ─────────────────────────────────────────────

export const listingCreateSchema = z.object({
  // Temel bilgiler
  category: z.enum(LISTING_CATEGORIES, {
    error: "Geçerli bir kategori seçiniz",
  }),
  type: z.enum(LISTING_TYPES, { error: "Satılık veya kiralık seçiniz" }),
  status: z.enum(LISTING_STATUSES).default("DRAFT"),

  // Çok dilli içerik
  titleTr: z
    .string()
    .min(3, "Başlık en az 3 karakter olmalı")
    .max(200, "Başlık en fazla 200 karakter olabilir")
    .trim(),
  titleEn: z.string().max(200).trim().optional(),
  descriptionTr: z
    .string()
    .min(10, "Açıklama en az 10 karakter olmalı")
    .max(5000, "Açıklama en fazla 5000 karakter olabilir")
    .trim(),
  descriptionEn: z.string().max(5000).trim().optional(),

  // Fiyat
  price: z.preprocess(
    (v) => Number(v),
    z.number().positive("Fiyat sıfırdan büyük olmalı")
  ),
  currency: z.string().default("TRY"),

  // Konum
  city: z.string().default("Eskişehir"),
  district: z.string().min(1, "İlçe zorunludur").trim(),
  neighborhood: optStr,
  address: optStr,
  latitude: optNum(z.number().min(-90).max(90)),
  longitude: optNum(z.number().min(-180).max(180)),

  // Alan
  area: z.preprocess(
    (v) => Number(v),
    z.number().positive("Alan sıfırdan büyük olmalı")
  ),
  netArea: optNum(z.number().positive()),

  // ─── Ev / Daire (HOUSE) & Dükkan (SHOP) alanları ───────────────────────────
  rooms: optStr,                                    // "3+1", "2+1"
  bathrooms: optNum(z.number().int().min(0)),
  buildingAge: optNum(z.number().int().min(0)),
  floor: optNum(z.number().int()),
  totalFloors: optNum(z.number().int().min(1)),
  heating: optStr,                                  // "Doğalgaz", "Kombi"
  furnished: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasSecurity: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  inSite: z.boolean().optional(),
  facade: optStr,                                   // cephe yönü
  creditEligible: z.boolean().optional(),
  deedStatus: optStr,                               // tapu türü

  // ─── Arsa (LAND) & Tarla (FIELD) alanları ──────────────────────────────────
  zoningStatus: optStr,                             // imar durumu
  kaks: optNum(z.number().min(0)),                  // emsal
  taks: optNum(z.number().min(0)),
  islandNumber: optStr,
  parcelNumber: optStr,

  // ─── Dükkan (SHOP) özellikleri ─────────────────────────────────────────────
  ceilingHeight: optNum(z.number().positive()),
  storefrontWidth: optNum(z.number().positive()),

  // ─── Genel ─────────────────────────────────────────────────────────────────
  virtualTourUrl: z
    .string()
    .url("Geçerli bir URL giriniz")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  featured: z.boolean().default(false),
});

// ─── Güncelleme şeması (tüm alanlar opsiyonel) ───────────────────────────────

export const listingUpdateSchema = listingCreateSchema.partial();

// ─── Durum güncelleme şeması (sadece status) ─────────────────────────────────

export const listingStatusSchema = z.object({
  status: z.enum(LISTING_STATUSES),
});

// ─── Listeleme filtre şeması (public /ilanlar sayfası) ───────────────────────

// URL'de tekrarlı param (?ilce=X&ilce=Y) → string[] dönüştürücü
const strArray = z.preprocess(
  (v) => {
    if (!v) return [];
    return Array.isArray(v) ? v.filter(Boolean) : [v];
  },
  z.array(z.string())
);

export const listingFilterSchema = z.object({
  // Temel filtreler — her kategoride
  category: z.enum(LISTING_CATEGORIES).optional(),
  type: z.enum(LISTING_TYPES).optional(),
  districts: strArray.optional(),  // multi-select ilçe
  minPrice: optNum(z.number().min(0)),
  maxPrice: optNum(z.number().min(0)),
  minArea: optNum(z.number().min(0)),
  maxArea: optNum(z.number().min(0)),

  // HOUSE / SHOP kategorisi filtreleri
  rooms: strArray.optional(),      // multi-select oda sayısı
  minBathrooms: optNum(z.number().int().min(0)),
  heating: z.string().optional(),

  // Toggle özellikler (HOUSE / SHOP)
  hasBalcony: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  hasElevator: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  hasParking: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  hasSecurity: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  hasPool: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  inSite: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  furnished: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),

  // LAND / FIELD kategorisi filtreleri
  zoningStatus: z.string().optional(),

  // Sayfalama & sıralama
  featured: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  page: z.preprocess((v) => Number(v) || 1, z.number().int().min(1)).default(1),
  limit: z.preprocess(
    (v) => Math.min(Number(v) || 12, 48),
    z.number().int().min(1).max(48)
  ).default(12),
  sort: z
    .enum(["newest", "oldest", "price_asc", "price_desc", "area_asc", "area_desc"])
    .default("newest"),
});

// ─── TypeScript tipleri ───────────────────────────────────────────────────────

export type ListingCreateInput = z.infer<typeof listingCreateSchema>;
export type ListingUpdateInput = z.infer<typeof listingUpdateSchema>;
export type ListingFilterInput = z.infer<typeof listingFilterSchema>;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];
export type ListingType = (typeof LISTING_TYPES)[number];
export type ListingStatus = (typeof LISTING_STATUSES)[number];

// Filtre paneli için boş başlangıç state'i
export const EMPTY_FILTER_STATE: Partial<ListingFilterInput> = {
  category: undefined,
  type: undefined,
  districts: [],
  rooms: [],
  minPrice: undefined,
  maxPrice: undefined,
  minArea: undefined,
  maxArea: undefined,
  heating: undefined,
  zoningStatus: undefined,
  hasBalcony: undefined,
  hasElevator: undefined,
  hasParking: undefined,
  hasSecurity: undefined,
  hasPool: undefined,
  inSite: undefined,
  furnished: undefined,
};
