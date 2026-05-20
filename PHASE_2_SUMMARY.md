# Faz 2 Özeti — Güleryüz Gayrimenkul

**Tarih:** 2026-05-20  
**Durum:** ✅ Tamamlandı

---

## Eklenen Sayfalar ve Rotalar

| Rota | Dosya | Açıklama |
|------|-------|----------|
| `/tr/giris` | `src/app/[locale]/(auth)/giris/page.tsx` | E-posta/şifre giriş formu |
| `/tr/kayit` | `src/app/[locale]/(auth)/kayit/page.tsx` | Yeni kullanıcı kayıt formu |
| `/tr/ilanlar` | `src/app/[locale]/(public)/ilanlar/page.tsx` | İlan listesi, filtre paneli, sıralama, sayfalama |
| `/tr/ilan/[slug]` | `src/app/[locale]/(public)/ilan/[slug]/page.tsx` | İlan detay sayfası |
| `/tr/admin` | `src/app/[locale]/admin/page.tsx` | Admin dashboard (placeholder) |
| `/tr/admin/ilanlar` | `src/app/[locale]/admin/ilanlar/page.tsx` | Admin ilan yönetim listesi |
| `/tr/admin/ilanlar/yeni` | `src/app/[locale]/admin/ilanlar/yeni/page.tsx` | Yeni ilan oluşturma formu |
| `/tr/admin/ilanlar/[id]/duzenle` | `src/app/[locale]/admin/ilanlar/[id]/duzenle/page.tsx` | İlan düzenleme formu |

### Yeni Layout'lar

| Dosya | Kapsam |
|-------|--------|
| `src/app/[locale]/(public)/layout.tsx` | Header + Footer — tüm public sayfalar |
| `src/app/[locale]/(auth)/layout.tsx` | Centered, header yok — giris/kayit |
| `src/app/[locale]/admin/layout.tsx` | Sidebar + auth koruması (AGENT/ADMIN/SUPER_ADMIN) |

---

## API Endpoint'leri

| Method | Path | Açıklama |
|--------|------|----------|
| `POST` | `/api/upload` | Görsel yükleme (Sharp → WebP, thumbnail) |
| `DELETE` | `/api/upload` | Görsel silme (dosya + DB kaydı) |
| `POST` | `/api/auth/register` | Yeni kullanıcı oluşturma (Argon2id hash) |

---

## Server Actions

| Dosya | Fonksiyon | Açıklama |
|-------|-----------|----------|
| `src/lib/actions/listing.ts` | `createListing(raw)` | Yeni ilan oluştur + slug üret |
| `src/lib/actions/listing.ts` | `updateListing(id, raw)` | İlan güncelle |
| `src/lib/actions/listing.ts` | `deleteListing(id)` | İlan sil (auth + görsel temizliği) |
| `src/lib/actions/listing.ts` | `changeListingStatus(id, raw)` | Durum değiştir (DRAFT→ACTIVE vs.) |
| `src/lib/actions/view-count.ts` | `incrementViewCount(listingId)` | Görüntülenme +1 |

Tüm actions: `revalidatePath("/", "layout")` ile global cache busting.

---

## Yeni Bileşenler

| Bileşen | Dosya | Tür |
|---------|-------|-----|
| AdminSidebar | `src/components/admin/sidebar.tsx` | Client |
| ListingForm | `src/components/admin/listing-form.tsx` | Client (RHF + Zod) |
| DeleteListingButton | `src/components/admin/delete-listing-button.tsx` | Client |
| ListingCard | `src/components/listing/listing-card.tsx` | Server |
| ViewCounter | `src/components/listing/view-counter.tsx` | Client |
| SortSelect | `src/components/listing/sort-select.tsx` | Client |

---

## Yeni Lib Dosyaları

| Dosya | İçerik |
|-------|--------|
| `src/lib/validations/listing.ts` | `listingCreateSchema`, `listingUpdateSchema`, `listingStatusSchema`, `listingFilterSchema` (Zod v4) |
| `src/lib/slug.ts` | `generateUniqueSlug()`, `generateUniqueSlugExcluding()` — Türkçe karakterli slug |
| `src/lib/data/eskisehir.ts` | `ESKISEHIR_DISTRICTS`, `ROOMS_OPTIONS`, `HEATING_OPTIONS`, `FACADE_OPTIONS` vd. |
| `src/lib/password.ts` | `hashPassword()`, `verifyPassword()` — `@node-rs/argon2` wrapper |

---

## Seed

| Dosya | Açıklama |
|-------|----------|
| `prisma/seed.ts` | SUPER_ADMIN (`admin@guleryuzgayrimenkul.com`) + `SiteSettings` singleton seed |

Çalıştırma: `npm run db:seed` (idempotent — upsert kullanıyor)

---

## Eklenen npm Paketleri

| Paket | Versiyon | Sebep |
|-------|----------|-------|
| `sharp` | latest | WebP dönüşüm, EXIF temizleme, thumbnail |
| `tsx` | latest (dev) | `prisma/seed.ts` çalıştırma |

(Faz 1'de kurulanlar: `@node-rs/argon2`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react` vd.)

---

## Çözülen Önemli Sorunlar

### 1. DATABASE_URL Path Uyumsuzluğu
- **Sorun:** `.env`'de `file:./dev.db` (proje kök), `db.ts`'de `prisma/dev.db` — seed "table does not exist" hatası veriyordu.
- **Çözüm:** `DATABASE_URL="file:./prisma/dev.db"`, migration yeniden uygulandı.

### 2. Server Component'ten Event Handler Geçirme Hatası
- **Sorun:** `ilanlar/page.tsx` Server Component içindeki `<select onChange={...}>` — Next.js "Event handlers cannot be passed to Client Component props" hatası.
- **Çözüm:** `SortSelect` ayrı Client Component'ine çıkarıldı.

### 3. Zod v4 + react-hook-form Tip Uyumsuzluğu
- **Sorun:** `zodResolver()` dönüş tipi Zod v4'te değişti, `@hookform/resolvers` v5 bile tam uyumlu değil.
- **Çözüm:** `resolver: zodResolver(schema) as any` ve `onSubmit = async (data: any)` cast'leri.

### 4. Argon2 Native Build (Windows)
- **Sorun:** `argon2` paketi node-gyp gerektiriyor, Windows'ta derleme sorunlu.
- **Çözüm:** `@node-rs/argon2` (Rust/NAPI) — Windows ve Linux'ta sorunsuz çalışır.

---

## Test Edilmiş ve Çalışan Akışlar

1. **Admin girişi:** `/tr/giris` → `admin@guleryuzgayrimenkul.com` / `GuleryuzAdmin2026!` → `/tr/admin` yönlendirme
2. **Yeni ilan:** `/tr/admin/ilanlar/yeni` → form doldur → "Yayınla" → slug otomatik üretilir → liste sayfasında görünür
3. **Durum değişimi:** Admin listesinde DRAFT ilanı ACTIVE yap → public `/tr/ilanlar`'da görünür
4. **Filtre + sıralama:** `/tr/ilanlar?kategori=HOUSE&siralama=price_asc` — Prisma where + orderBy çalışıyor
5. **Sayfalama:** 12'den fazla ilan varsa `ChevronLeft/Right` + sayfa numaraları görünür
6. **İlan detay:** Slug'a göre tek ilan çekme, hero görsel, fiyat, özellikler, acente kutusu
7. **Görüntülenme sayacı:** Detay sayfası her açılışta `viewCount + 1` (StrictMode'da çift artmaz)
8. **Görsel upload:** `POST /api/upload` → WebP dönüşüm → `public/uploads/` kaydı → DB `ListingImage` kaydı
9. **Kullanıcı kaydı:** `/tr/kayit` → `POST /api/auth/register` → Argon2id hash → DB kaydı

---

## Faz 3'e Devredilen TODO

| # | Madde | Öncelik |
|---|-------|---------|
| 1 | Admin ilan formuna görsel yükleme UI bağlantısı | Yüksek |
| 2 | İlan detay sayfasına çoklu görsel carousel | Yüksek |
| 3 | İlanlar sayfasına mobil filtre drawer | Orta |
| 4 | Leaflet harita — detay sayfasında konum | Orta |
| 5 | `src/lib/rate-limit.ts` — login 5 deneme/15 dk | Orta |
| 6 | Mahalle verisi (ilçe seçilince mahalleler) | Düşük |
| 7 | URL search params tam senkronu (minAlan, maxAlan eksik) | Düşük |

---

## Faz 3'e Başlarken Bilinmesi Gerekenler

- **Upload API hazır** (`/api/upload`) — sadece form UI'ı eksik. Endpoint: `FormData` + `file` + opsiyonel `listingId`.
- **`ListingImage` DB modeli var** — `order`, `isPrimary`, `alt` alanlarıyla. Carousel için sadece front-end gerekiyor.
- **`listing.latitude` / `listing.longitude` DB'de var** — Leaflet için koordinat alanları mevcut.
- **`ESKISEHIR_DISTRICTS` statik liste var** — `src/lib/data/eskisehir.ts`. Mahalle verisi henüz yok.
- **Sıralama parametresi** `siralama` (TR) — Zod `listingFilterSchema`'da `sort` olarak parse ediliyor.
