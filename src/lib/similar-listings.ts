import { db } from "@/lib/db";

export type SimilarListingParams = {
  id: string;
  category: string;
  type: string;
  district: string;
  price: number; // Decimal.toNumber() — cache serializability için number
  rooms: string | null;
};

export type SimilarListingResult = {
  id: string;
  slug: string;
  titleTr: string;
  price: number;
  currency: string;
  district: string;
  category: string;
  type: string;
  area: number;
  rooms: string | null;
  bathrooms: number | null;
  featured: boolean;
  images: { url: string; isPrimary: boolean; alt: string | null }[];
};

// Odunpazarı ↔ Tepebaşı kentsel komşuluk
const URBAN_DISTRICTS = new Set(["Odunpazarı", "Tepebaşı"]);

// "3+1" → 3, "Stüdyo" → null
function parseRoomCount(rooms: string | null): number | null {
  if (!rooms) return null;
  const n = parseInt(rooms, 10);
  return isNaN(n) ? null : n;
}

function calcScore(
  candidate: { district: string; price: number; rooms: string | null },
  params: SimilarListingParams
): number {
  let s = 0;

  // Konum (+3 aynı ilçe, +1 kentsel komşu)
  if (candidate.district === params.district) {
    s += 3;
  } else if (
    URBAN_DISTRICTS.has(candidate.district) &&
    URBAN_DISTRICTS.has(params.district)
  ) {
    s += 1;
  }

  // Fiyat ±%15 (outer query ±%30 filtreler, inner ±%15 bonus)
  if (params.price > 0) {
    const ratio = candidate.price / params.price;
    if (ratio >= 0.85 && ratio <= 1.15) s += 2;
  }

  // Oda sayısı (yalnızca HOUSE kategorisi)
  if (params.category === "HOUSE") {
    const cr = parseRoomCount(candidate.rooms);
    const pr = parseRoomCount(params.rooms);
    if (cr !== null && pr !== null) {
      const diff = Math.abs(cr - pr);
      if (diff === 0) s += 2;
      else if (diff === 1) s += 1;
    }
  }

  return s;
}

export async function getSimilarListings(
  params: SimilarListingParams
): Promise<SimilarListingResult[]> {
  const minPrice = params.price * 0.7;
  const maxPrice = params.price * 1.3;

  const where: Record<string, unknown> = {
    id: { not: params.id },
    status: "ACTIVE",
    category: params.category,
    type: params.type,
  };

  // Fiyat filtresi: sıfır fiyatlı ilanlarda aralık sonsuz olur, atla
  if (params.price > 0) {
    where.price = { gte: minPrice, lte: maxPrice };
  }

  const candidates = await db.listing.findMany({
    where,
    take: 30,
    orderBy: { createdAt: "desc" },
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
  });

  // Decimal → number, skor hesapla, sırala, top 4 döndür
  const scored = candidates
    .map((c) => ({
      listing: {
        ...c,
        price: c.price.toNumber(),
        category: c.category as string,
        type: c.type as string,
        images: c.images.map((img) => ({
          ...img,
          alt: img.alt ?? null,
        })),
      },
      score: 0,
    }))
    .map((item) => ({
      ...item,
      score: calcScore(item.listing, params),
    }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 4).map((s) => s.listing);
}
