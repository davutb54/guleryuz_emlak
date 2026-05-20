import locations from "./eskisehir-locations.json";

// İlçe listesi JSON'dan türetilir — tek kaynak of truth
export const ESKISEHIR_DISTRICTS = Object.keys(locations) as Array<keyof typeof locations>;

// Verilen ilçenin mahallelerini döner; bilinmeyen ilçe için []
export function getNeighborhoods(district: string): string[] {
  return (locations as Record<string, string[]>)[district] ?? [];
}

// Tüm lokasyon haritası (ilçe → mahalle[])
export const ESKISEHIR_LOCATIONS = locations as Record<string, string[]>;

// ─── Filtre seçenekleri ───────────────────────────────────────────────────────

export const ROOMS_OPTIONS = [
  "Stüdyo",
  "1+0",
  "1+1",
  "2+1",
  "3+1",
  "4+1",
  "5+1",
  "5+1 üzeri",
] as const;

export const HEATING_OPTIONS = [
  "Doğalgaz",
  "Kombi",
  "Merkezi",
  "Klima",
  "Soba",
  "Elektrikli",
  "Yok",
] as const;

export const FACADE_OPTIONS = [
  "Kuzey",
  "Güney",
  "Doğu",
  "Batı",
  "Kuzeydoğu",
  "Kuzeybatı",
  "Güneydoğu",
  "Güneybatı",
] as const;

export const DEED_STATUS_OPTIONS = [
  "Kat Mülkiyeti",
  "Kat İrtifakı",
  "Hisseli Tapu",
  "Arsa Tapusu",
  "Müstakil Tapulu",
] as const;

export const ZONING_STATUS_OPTIONS = [
  "Konut İmarlı",
  "Ticari İmarlı",
  "Konut + Ticari",
  "Tarım Arazisi",
  "Orman",
  "İmar Dışı",
  "Planlama Aşamasında",
] as const;
