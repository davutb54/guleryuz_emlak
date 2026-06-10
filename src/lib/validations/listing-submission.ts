import { z } from "zod";
import { LISTING_CATEGORIES, LISTING_TYPES } from "./listing";

const optNum = (schema: z.ZodNumber = z.number()) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    schema.optional()
  );

const optStr = z
  .string()
  .transform((v) => (v.trim() === "" ? undefined : v.trim()))
  .optional();

export const listingSubmissionSchema = z.object({
  // İletişim bilgileri (zorunlu)
  contactName: z.string().min(2, "Ad Soyad en az 2 karakter olmalı").max(100).trim(),
  contactPhone: z
    .string()
    .min(10, "Geçerli bir telefon numarası giriniz")
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/, "Geçerli bir telefon numarası giriniz")
    .trim(),
  contactEmail: z.string().email("Geçerli bir e-posta adresi giriniz").max(200).trim(),

  // İlan temel bilgileri
  category: z.enum(LISTING_CATEGORIES, { error: "Geçerli bir kategori seçiniz" }),
  type: z.enum(LISTING_TYPES, { error: "Satılık veya kiralık seçiniz" }),
  titleTr: z
    .string()
    .min(5, "Başlık en az 5 karakter olmalı")
    .max(200, "Başlık en fazla 200 karakter olabilir")
    .trim(),
  descriptionTr: z
    .string()
    .min(20, "Açıklama en az 20 karakter olmalı")
    .max(3000)
    .trim()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  price: z.coerce.number().positive("Fiyat sıfırdan büyük olmalı"),
  currency: z.string().default("TRY"),

  // Konum
  city: z.string().default("Eskişehir"),
  district: z.string().min(1, "İlçe seçimi zorunludur").trim(),
  neighborhood: optStr,
  address: optStr,

  // Alan
  area: z.coerce.number().positive("Alan sıfırdan büyük olmalı"),
  netArea: optNum(z.number().positive()),

  // Ev / Daire özellikleri
  rooms: optStr,
  bathrooms: optNum(z.number().int().min(0)),
  buildingAge: optNum(z.number().int().min(0)),
  floor: optNum(z.number().int()),
  totalFloors: optNum(z.number().int().min(1)),
  heating: optStr,
  furnished: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  hasElevator: z.boolean().optional(),
  hasParking: z.boolean().optional(),
  hasSecurity: z.boolean().optional(),
  hasPool: z.boolean().optional(),
  inSite: z.boolean().optional(),
  facade: optStr,
  creditEligible: z.boolean().optional(),
  deedStatus: optStr,

  // Arsa / Tarla özellikleri
  zoningStatus: optStr,
  islandNumber: optStr,
  parcelNumber: optStr,
});

export type ListingSubmissionInput = z.infer<typeof listingSubmissionSchema>;
