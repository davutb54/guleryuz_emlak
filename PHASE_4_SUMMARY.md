# Faz 4 Özeti — Kullanıcı Etkileşimi

> Tarih: 2026-05-20 | Durum: ✅ Tamamlandı + 12 bug fix

---

## Eklenen Sayfalar / Rotalar

| Rota | Dosya | Açıklama |
|------|-------|----------|
| `/[locale]/(public)/profil` | `src/app/[locale]/(public)/profil/page.tsx` | Kullanıcı profili — favoriler + yorumlar + arama alarmları |
| `/[locale]/admin/yorumlar` | `src/app/[locale]/admin/yorumlar/page.tsx` | Yorum listesi + sil |
| `/[locale]/(public)` | `src/app/[locale]/(public)/page.tsx` | Ana sayfa (bug fix'te (public) grubuna taşındı) |
| `/[locale]/not-found` | `src/app/[locale]/not-found.tsx` | 404 sayfası — navy/gold tasarımı |

---

## Yeni Component'ler

### `src/components/listing/`

| Dosya | Açıklama |
|-------|----------|
| `favorite-button.tsx` | Heart toggle, `useTransition` + optimistic state |
| `comment-form.tsx` | Yıldız puanlama (1–5) + yorum metni, Server Action |
| `comment-list.tsx` | Onaylı yorumları listeler, yıldız + tarih |
| `share-buttons.tsx` | WhatsApp / X / Link kopyala (clipboard API) |
| `search-alert-form.tsx` | Profil sayfasında alarm oluşturma formu |
| `search-alert-inline.tsx` | `/ilanlar` sayfasında aktif filtrelerle hızlı alarm kurma |
| `delete-search-alert-button.tsx` | Profil sayfasında alarm silme butonu |

### `src/components/layout/`

| Dosya | Açıklama |
|-------|----------|
| `header-wrapper.tsx` | Server Component — `auth()` + bildirim DB sorgusu burada |
| `notification-dropdown.tsx` | Client Component — zil ikonu + dropdown, okundu/okunmadı |

### `src/components/admin/`

| Dosya | Açıklama |
|-------|----------|
| `admin-shell.tsx` | Client Component — mobile hamburger + overlay sidebar wrapper |

---

## Değiştirilen Component'ler

| Dosya | Ne Değişti |
|-------|-----------|
| `src/components/layout/header.tsx` | `user/notifications/unreadCount` prop alıyor; logout butonu eklendi (desktop + mobile) |
| `src/components/admin/sidebar.tsx` | `onNavigate` prop eklendi; `h-full` class eklendi |
| `src/components/listing/listing-gallery.tsx` | Tam ekran lightbox (Escape/ok tuşu/thumbnail strip) eklendi |
| `src/components/listing/listing-map.tsx` | `center/zoom` prop + harita popup'ına "Yol Tarifi Al" butonu |
| `src/components/listing/listing-map-client.tsx` | `center/zoom` prop geçişi eklendi |
| `src/app/[locale]/admin/layout.tsx` | `AdminSidebar` → `AdminShell` ile değiştirildi |
| `src/components/hero/home-hero.tsx` | Arama butonu `router.push("/ilanlar?...")` ile çalışıyor |

---

## Yeni Server Actions

| Dosya | Fonksiyonlar |
|-------|-------------|
| `src/lib/actions/favorite.ts` | `toggleFavorite(listingId)` |
| `src/lib/actions/comment.ts` | `createComment`, `approveComment`, `deleteComment` |
| `src/lib/actions/notification.ts` | `markAllNotificationsRead`, `markNotificationRead` |
| `src/lib/actions/search-alert.ts` | `createSearchAlert`, `deleteSearchAlert`, `toggleSearchAlert` |

---

## Yeni Lib Dosyaları

| Dosya | Açıklama |
|-------|----------|
| `src/lib/rate-limit.ts` | In-memory rate limiter (login 5/15dk, kayıt 3/10dk) |
| `src/lib/email.ts` | Resend email helper + 2 şablon |
| `src/lib/cron.ts` | SearchAlert kontrol mantığı |
| `src/instrumentation.ts` | Next.js server startup hook — cron kaydı |

---

## Yeni Zod Validasyonları

| Dosya | Schema |
|-------|--------|
| `src/lib/validations/comment.ts` | `commentCreateSchema` (content min 10, max 1000; rating opsiyonel 1–5) |
| `src/lib/validations/search-alert.ts` | `searchAlertCreateSchema` (name, filters JSON, frequency enum) |

---

## Eklenen npm Paketleri

```json
"resend": "^6.12.3",
"node-cron": "^4.2.1",
"@types/node-cron": "^3.0.11"
```

---

## Prisma — Kullanılan Modeller (Yeni Migration Yok)

Faz 4'te aşağıdaki modeller ilk kez kullanıma girdi (şema baştan vardı):

- **`Favorite`** — `@@unique([userId, listingId])` ile upsert/delete pattern
- **`Comment`** — `approved: true` default (bug fix'ten sonra); rating opsiyonel 1–5
- **`Notification`** — type: `new_listing_match | price_drop | comment_reply | favorite_status_change`
- **`SearchAlert`** — filters JSON string; frequency: `instant | daily | weekly`

---

## Email Şablonları

**Konum:** `src/lib/email.ts`

| Fonksiyon | Konu | Ne Zaman |
|-----------|------|----------|
| `sendCommentApprovedEmail` | "Yorumunuz yayınlandı" | `approveComment` çağrıldığında (şu an kullanılmıyor — approved: true default) |
| `sendSearchAlertEmail` | "{N} yeni ilan: {alertName}" | `checkSearchAlerts()` cron'unda eşleşme bulununca |

**Tasarım:** Inline HTML, navy (`#0A1628`) arka plan, gold (`#D4A744`) aksanlar, CTA butonu.

**Dev'de çalışma:** `RESEND_API_KEY` boşsa fonksiyonlar sessizce return eder (hata vermez).

---

## Cron Job Yapısı

```
instrumentation.ts (Next.js server startup)
  └─ register() → node-cron.schedule("0 22 * * *", checkSearchAlerts, { timezone: "Europe/Istanbul" })
                         │
                         ▼
                 lib/cron.ts: checkSearchAlerts()
                   ├─ db.searchAlert.findMany({ active: true })
                   ├─ Her alert için:
                   │    ├─ Frekans → tarih aralığı (daily: -1gün, weekly: -7gün)
                   │    ├─ Prisma sorgu (category, type, district, rooms, price filtreler)
                   │    ├─ Eşleşme varsa → db.notification.create (in-app)
                   │    └─ Eşleşme varsa → sendSearchAlertEmail (Resend)
                   └─ console.log("[cron] Tamamlandı.")
```

**Tetiklenme:** Her gün 22:00 Europe/Istanbul. `NEXT_RUNTIME === "nodejs"` kontrolüyle Edge runtime'da çalışmaz.

---

## Test Akışları

### 1. Kullanıcı İlan Favoriler → Profilde Görünür
1. Giriş yap (`/giris`)
2. Herhangi bir ilan detay sayfasına git
3. Kalp ikonuna tıkla → optimistic UI anında güncellenir
4. `/profil` sayfasına git → "Favorilerim" sekmesinde ilan görünür
5. Tekrar kalp ikonuna tıkla → favori kaldırılır, profilden de düşer

### 2. Kullanıcı Yorum Yazar → Anında Görünür
1. Giriş yap
2. İlan detay sayfasında yorum formuna yorum yaz (min 10 karakter)
3. Opsiyonel: yıldız ver (1–5)
4. "Yorum Gönder"e tıkla
5. Yorum anında sayfada görünür (admin onayı gerekmez)
6. `/admin/yorumlar`'da ilan adı + kullanıcı + içerik görünür, sil butonu çalışır

### 3. Arama Alarmı Kurulur → Cron → Bildirim
1. `/ilanlar` sayfasında filtre uygula (ör. Odunpazarı + Satılık + 3+1)
2. Sayfanın altında `SearchAlertInline` belirir → "Alarm Kur"a tıkla
3. Başarı mesajı görünür
4. `/profil` → "Arama Alarmlarım" sekmesinde alarm görünür
5. (Test için) Sunucu logunda `checkSearchAlerts()` manuel çağrılabilir
6. Eşleşen yeni ilan varsa: header'da zil ikonunda okunmamış sayısı artar + email gelir

### 4. İlan WhatsApp/X Paylaşılır → OG Preview Doğru
1. Herhangi ilan detay sayfasına git
2. "Paylaş" butonlarından WhatsApp'a tıkla → `wa.me/?text=...{url}` açılır
3. X'e tıkla → `x.com/intent/tweet?text=...` açılır
4. Link kopyala → clipboard'a kopyalanır, "Kopyalandı" feedback'i görünür
5. Open Graph doğrulama: `https://developers.facebook.com/tools/debug/` veya `https://cards-dev.twitter.com/validator` ile URL kontrol et → başlık, fiyat, görsel görünmeli

### 5. Navigasyon Butonu
1. `/ilanlar?gorunum=harita` sayfasına git
2. Koordinatlı bir markere tıkla → popup açılır
3. "Yol Tarifi" butonuna tıkla → Google Maps açılır, koordinatlar destination olarak set edilir
4. Mobil cihazda: Google Maps uygulaması açılır (yüklüyse)

---

## Post-Faz-4 Bug Fixes (Aynı Oturumda)

| # | Fix |
|---|-----|
| 1 | Yorumlar `approved: true` default — admin sadece sil |
| 2 | Ana sayfa `(public)` grubuna taşındı → Header/Footer çalışıyor |
| 3 | Ana sayfa DB'den öne çıkan ilanları çekiyor |
| 4 | Arama butonu `/ilanlar` sayfasına navigate ediyor |
| 5 | Header logout butonu (desktop + mobile) |
| 6 | 404 sayfası navy/gold tasarımıyla |
| 7 | Mobile `/ilanlar`: tek sticky toolbar (çift buton sorunu giderildi) |
| 8 | Admin panel hamburger sidebar (AdminShell) |
| 9 | `DialogContent` → `Dialog.Title className="sr-only"` accessibility fix |
| 10 | Admin form `<select>` seçenekleri görünür (`[&>option]:bg-navy-800`) |
| 11 | Galeri: tam ekran lightbox (Escape + ok tuşları + thumbnail) |
| 12 | İlan detay haritası: gerçek Leaflet, Zoom 15, placeholder kaldırıldı |
| + | Harita popup + detay sayfasına Google Maps "Yol Tarifi Al" butonu |

---

## Faz 5'e Devreden TODO'lar

### Kritik (Faz 5 başında)
- [ ] `src/lib/audit.ts` — admin eylem log helper (kullanıcı/ilan yönetiminden önce)
- [ ] Dashboard — Recharts: aktif ilan, haftalık görüntülenme, yeni üye, kategori pasta grafik

### Önemli
- [ ] İlan yönetimi gelişmiş — status filtresi + toplu işlem (actif/pasif/arşiv/sil)
- [ ] Kullanıcı yönetimi — rol değişimi + ban + audit log
- [ ] Galeri yönetimi — GalleryItem CRUD + foto/video upload
- [ ] İletişim mesajları — ContactMessage listesi + okundu işareti
- [ ] Audit log görüntüleyici — filtreli tablo

### Sonraya
- [ ] Logo placeholder → `/public/brand/logo.svg`
- [ ] Hero arka plan gerçek fotoğraf
- [ ] SearchAlert "instant" frequency → `createListing` hook
- [ ] Google OAuth test (`GOOGLE_CLIENT_ID` boş)
- [ ] `ecosystem.config.js` PM2 config

---

## Faz 5 Kritik Bilgiler

**Admin layout:** `AdminShell` (client) üzerinden çalışıyor. Tüm yeni admin sayfaları `src/app/[locale]/admin/` altına gidiyor, layout otomatik wrap ediyor.

**Audit log pattern:**
```ts
import { auditLog } from "@/lib/audit";
await auditLog(session.user.id, "user.ban", "User", targetUserId, { reason });
```

**Recharts import:**
```ts
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
```
`recharts` paketi zaten `package.json`'da var.

**DB istatistik sorguları (Dashboard için):**
```ts
const [activeListings, totalUsers, recentViews] = await Promise.all([
  db.listing.count({ where: { status: "ACTIVE" } }),
  db.user.count(),
  db.listing.aggregate({ _sum: { viewCount: true } }),
]);
```
