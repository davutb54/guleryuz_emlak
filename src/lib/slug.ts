import { db } from "@/lib/db";

// Türkçe karakterleri ASCII'ye çevir, slug-safe hale getir
function turkishToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// "modern-villa-tepebasi-3-1" formatında benzersiz slug üretir
export async function generateUniqueSlug(
  titleTr: string,
  district: string,
  rooms?: string | null
): Promise<string> {
  const base = [titleTr, district, rooms]
    .filter(Boolean)
    .map((part) => turkishToSlug(part!))
    .join("-")
    .slice(0, 80); // URL uzunluğunu sınırla

  // Benzersizlik kontrolü: varsa sonuna -2, -3 ekle
  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.listing.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

// Güncelleme sırasında: kendi id'si hariç kontrol et
export async function generateUniqueSlugExcluding(
  titleTr: string,
  district: string,
  excludeId: string,
  rooms?: string | null
): Promise<string> {
  const base = [titleTr, district, rooms]
    .filter(Boolean)
    .map((part) => turkishToSlug(part!))
    .join("-")
    .slice(0, 80);

  let candidate = base;
  let suffix = 2;

  while (true) {
    const existing = await db.listing.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || existing.id === excludeId) return candidate;

    candidate = `${base}-${suffix}`;
    suffix++;
  }
}
