# Faz 3 Özeti — Gelişmiş Arama

> Tamamlanma: 2026-05-20

---

## Yeni Sayfalar / Route Değişiklikleri

| Sayfa | Değişiklik |
|-------|-----------|
| `/ilanlar` | Filtre paneli + sayfalama + `?gorunum=harita` toggle eklendi |
| `/ilan/[slug]` | Static hero → `ListingGallery` carousel; altta `SimilarListings` bölümü eklendi |

---

## Yeni Dosyalar

### Bileşenler

| Dosya | Açıklama |
|-------|---------|
| `src/components/listing/filter-panel.tsx` | Desktop sticky filtre sidebar (Client Component, Suspense boundary) |
| `src/components/listing/filter-sheet.tsx` | Mobil bottom sheet (Radix Dialog, `"use client"`) |
| `src/components/listing/view-toggle.tsx` | Liste ↔ Harita toggle butonları (Server Component, prop tabanlı) |
| `src/components/listing/listing-map.tsx` | Leaflet harita + altın marker + popup card (`"use client"`, `leaflet/dist/leaflet.css`) |
| `src/components/listing/listing-map-client.tsx` | `ssr: false` wrapper — `next/dynamic` ile Leaflet'i SSR'dan koruyor |
| `src/components/listing/listing-gallery.tsx` | Çoklu görsel carousel: thumbnail strip, prev/next ok, klavye desteği (`"use client"`) |
| `src/components/listing/similar-listings.tsx` | "Benzer İlanlar" grid (Server Component, `getSimilarListings` çağrısı) |
| `src/components/admin/image-uploader.tsx` | Admin form için drag-and-drop upload UI + thumbnail grid + primary/remove aksiyon |

### Kütüphaneler / Yardımcılar

| Dosya | Açıklama |
|-------|---------|
| `src/lib/filter-utils.ts` | `FilterState`, `parseFiltersFromUrl`, `buildFilterUrl`, `countActiveFilters` — `"use client"` YOK (Server + Client ortak) |
| `src/hooks/use-listing-filters.ts` | `useListingFilters()` hook + `filter-utils.ts` re-export (`"use client"`) |
| `src/lib/similar-listings.ts` | `getSimilarListings()` — `"use cache"` + in-memory skor hesaplama |
| `src/lib/data/eskisehir-locations.json` | Eskişehir 14 ilçe + mahalle hiyerarşisi (statik JSON) |
| `src/lib/data/eskisehir.ts` | JSON'dan `ESKISEHIR_DISTRICTS`, `getNeighborhoods()`, `ESKISEHIR_LOCATIONS` türetme |

---

## Güncellenen Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `src/app/[locale]/(public)/ilanlar/page.tsx` | Harita view branch, `ListingMapClient`, `ViewToggle`, `neighborhood` where clause |
| `src/app/[locale]/(public)/ilan/[slug]/page.tsx` | `ListingGallery` + `SimilarListings` entegrasyonu |
| `src/components/admin/listing-form.tsx` | `ImageUploader` + `saveListingImages` entegrasyonu |
| `src/app/[locale]/admin/ilanlar/[id]/duzenle/page.tsx` | `images` DB query + `initialImages` prop |
| `src/lib/actions/listing.ts` | `saveListingImages` Server Action eklendi |
| `next.config.ts` | `experimental.cacheComponents: true` eklendi |

---

## Prisma / Veritabanı Değişiklikleri

**Yeni migration yok.** Mevcut şema Faz 3 için yeterliydi.

Mevcut index'ler kullanıldı:
- `@@index([category, type, status])` — benzer ilan sorgusu
- `@@index([price])` — fiyat aralığı filtresi
- `@@index([city, district])` — ilçe filtresi

---

## Kurulan npm Paketleri

```bash
npm install leaflet react-leaflet @types/leaflet
npm install @radix-ui/react-dialog  # (zaten shadcn'den gelebilir — kontrol et)
```

---

## Mimari Notlar

### Filtre Sistemi — URL State

```
FilterPanel (Client) → lokal useState<FilterState>
  → "Ara" tıklandı → router.push(buildFilterUrl(state))
  → ilanlar/page.tsx (Server) → parseFiltersFromUrl(searchParams)
  → Prisma where clause → sonuçlar
```

Multi-select URL encoding: `?ilce=Odunpazarı&ilce=Tepebaşı` (tekrar eden key).

### Harita Entegrasyonu — SSR Çözümü

```
ilanlar/page.tsx (Server Component)
  → <ListingMapClient listings={...} />   ← "use client" wrapper
      → dynamic(() => import('./listing-map'), { ssr: false })
          → ListingMap (react-leaflet, tarayıcı-only)
```

**Neden wrapper?** Next.js 16: `ssr: false` yalnızca Client Component'te kullanılabilir.

### Benzer İlanlar — Skor Algoritması

```
Skor hesaplama (tam eşleşme → en iyi):
  +3  aynı ilçe
  +1  kentsel komşu (Odunpazarı ↔ Tepebaşı)
  +2  fiyat ±%15 aralığında
  +2  aynı oda sayısı ("3+1" == "3+1")
  +1  ±1 oda farkı

Prisma query: kategori+tip+status sabit, fiyat ±%30 aralığı, take 30
In-memory sort → top 4 döndür
"use cache" direktifi → aynı ilan parametreleri için cache hit
```

### Decimal → number Serializasyon Kuralı

Prisma `Decimal` nesneleri RSC boundary'den geçemez ve `"use cache"` ile güvenli serialize edilemez. Her yerde:
```ts
price: listing.price.toNumber()  // Decimal → number
```
`ListingCard` `price: { toNumber(): number }` bekliyorsa adapter:
```ts
{ toNumber: () => price }  // number → wrapper
```

---

## Test Edilen Akışlar

- [x] Filtre panelinde kategori/tip/fiyat/ilçe seçimi → URL güncelleniyor → doğru sonuçlar
- [x] İlçe seçilince mahalle dropdown'u beliriyor; ilçe değişince mahalle sıfırlanıyor
- [x] Mobil bottom sheet açılıp filtreleme yapılabiliyor
- [x] Harita görünümüne geçince `?gorunum=harita` URL'ye ekleniyor, altın marker'lar görünüyor
- [x] Marker popup'larında ilan bilgileri doğru, "İlanı Gör" linki çalışıyor
- [x] Detay sayfasında prev/next butonları ve klavye ok tuşları çalışıyor
- [x] Thumbnail strip'te aktif görsel vurgulanıyor
- [x] Admin formunda fotoğraf yüklenip kaydedince `ListingImage` kaydı oluşuyor
- [x] Var olan ilanı düzenlerken mevcut görseller form açılışında yüklü geliyor
- [x] Birincil görsel (Ana badge) değiştirilebiliyor, silinebiliyor
- [x] `npx tsc --noEmit` — hata yok

---

## Faz 4'e Taşınan TODO'lar

- [ ] **Favori sistemi** — `POST /api/favorites`, `FavoriteButton` (kalp ikonlu), ilan kartlarında göster
- [ ] **Yorum sistemi** — `Comment` modeli hazır; yorum formu + admin moderasyon sayfası
- [ ] **Paylaş butonları** — WhatsApp/Instagram/X + Open Graph meta tag'leri (`og:image`, `og:title`)
- [ ] **Bildirim merkezi** — in-app dropdown + email (Resend/Nodemailer)
- [ ] **Arama alarmları** — `SearchAlert` modeli hazır; cron job + eşleşen ilan bildirimi
- [ ] **Rate limiting** — `src/lib/rate-limit.ts` login için 5 deneme/15 dk
- [ ] **Logo** — `/public/brand/logo.svg` gerçek logo ile değiştirilmeli
- [ ] **Hero arka planı** — CSS gradient → gerçek fotoğraf
