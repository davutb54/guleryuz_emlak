# Güleryüz Gayrimenkul — Proje Brief (CLAUDE.md)

> **Son Güncelleme: 2026-05-21 — Faz 6 A aşaması tamamlandı (sayfalar + SEO + KVKK) ✅ — Faz 6 B (deployment) sırada**

> Bu dosya Claude Code için proje bağlamıdır. Her oturumda otomatik okunur.
> Proje hakkındaki TÜM kararlar, mimari, yol haritası burada tutulur.
> Yeni kararlar alındıkça bu dosya güncellenmelidir.

---

## 1. Proje Özeti

**Marka:** Güleryüz Gayrimenkul — Eskişehir
**Tür:** Butik/lüks emlak ofisi web sitesi
**Hedef Kitle:** Eskişehir ve çevresinde ev/arsa/tarla/dükkan arayanlar
**Dil:** Türkçe (birincil) + İngilizce (i18n baştan kurulacak)
**Estetik:** Lacivert (#0A1F3A civarı) + altın gold (#D4A744 civarı) + gümüş aksanları. Modern, lüks, premium hissi. Referans tasarımlar: Luxe Estates, Luna Estates, Aurora Realty stilinde.

## 2. İş Modeli ve Önemli Kısıtlar

- **İlan ekleme YALNIZCA admin/agent tarafından yapılır.** Kullanıcılar ilan eklemez.
- Sahibi + 2-3 ortak = toplam ~3-4 admin/agent hesabı olacak.
- Ücretli üyelik YOK, premium ilan YOK, ödeme entegrasyonu YOK.
- Kullanıcılar şunları yapabilir: kayıt ol, giriş yap, ilan favorile, yorum yaz, bildirim al, ilan paylaş (WhatsApp/Instagram/X).
- Domain hazır (kullanıcının elinde).
- **Tek deployment:** Frontend + API + DB ayrı servislerde değil, tek Next.js projesi tek VPS'te.

## 3. Teknoloji Yığını (Karar Verildi)

| Katman | Teknoloji | Sebep |
|--------|-----------|-------|
| Framework | Next.js 16 (App Router) + TypeScript + React 19.2 | SEO, tek proje, RSC, Turbopack default |
| Veritabanı | SQLite + Prisma ORM | Bu trafik için yeterli, taşınabilir |
| Auth | Auth.js v5 (NextAuth) | Email/şifre + Google |
| UI Kit | Tailwind CSS v4 + shadcn/ui | Lüks tasarım hızlı (v4: CSS-first @theme) |
| Form | React Hook Form + Zod | Tip güvenli doğrulama |
| i18n | next-intl | App Router en iyi entegrasyon |
| Görsel | sharp + lokal dosya sistemi (`/public/uploads` veya `/data/uploads`) | VPS'te basit |
| Harita | Leaflet + OpenStreetMap | Ücretsiz |
| Email | Resend veya Nodemailer + SMTP | Bildirim ve iletişim formu |
| Grafik (admin) | Recharts | Dashboard istatistikleri |
| Şifre hash | Argon2id (`@node-rs/argon2` paketi) | bcrypt'ten güvenli, Windows/Linux NAPI native |
| Process | PM2 | VPS'te kalıcı çalışma |
| Reverse proxy | Nginx | SSL, statik cache |
| SSL | Certbot (Let's Encrypt) | Ücretsiz |

**Tahmini VPS:** Hetzner CPX21 (~€8/ay) veya Contabo VPS S.

## 4. Klasör Yapısı

```
guleryuz/
├── CLAUDE.md                    # bu dosya
├── README.md
├── .env                         # gitignore'da
├── .env.example
├── next.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── messages/                    # i18n çevirileri
│   ├── tr.json
│   └── en.json
├── public/
│   └── uploads/                 # ilan fotoğrafları (veya /data/uploads VPS'te)
├── src/
│   ├── app/
│   │   ├── [locale]/            # next-intl rotaları
│   │   │   ├── (public)/
│   │   │   │   ├── page.tsx               # ana sayfa
│   │   │   │   ├── ilanlar/page.tsx       # liste
│   │   │   │   ├── ilan/[slug]/page.tsx   # detay
│   │   │   │   ├── hakkimizda/page.tsx
│   │   │   │   ├── iletisim/page.tsx
│   │   │   │   ├── galeri/page.tsx        # anılar
│   │   │   │   └── profil/page.tsx
│   │   │   ├── (auth)/
│   │   │   │   ├── giris/page.tsx
│   │   │   │   └── kayit/page.tsx
│   │   │   └── admin/
│   │   │       ├── layout.tsx             # admin korumalı
│   │   │       ├── page.tsx               # dashboard
│   │   │       ├── ilanlar/
│   │   │       ├── kullanicilar/
│   │   │       ├── yorumlar/
│   │   │       ├── galeri/
│   │   │       ├── ayarlar/
│   │   │       └── audit-log/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   ├── listings/
│   │   │   ├── favorites/
│   │   │   ├── comments/
│   │   │   ├── notifications/
│   │   │   ├── upload/
│   │   │   └── contact/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn componentleri
│   │   ├── listing/
│   │   ├── admin/
│   │   ├── layout/
│   │   └── shared/
│   ├── lib/
│   │   ├── auth.ts              # Auth.js config
│   │   ├── db.ts                # Prisma client
│   │   ├── rate-limit.ts
│   │   ├── audit.ts             # audit log helper
│   │   ├── validations/         # Zod şemaları
│   │   └── utils.ts
│   ├── i18n/
│   │   └── routing.ts
│   └── middleware.ts            # auth + locale + rate limit
└── ecosystem.config.js          # PM2
```

## 5. Veritabanı Şeması (Prisma — Taslak)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  AGENT
  ADMIN
  SUPER_ADMIN
}

enum ListingCategory {
  HOUSE       // Ev/Daire
  LAND        // Arsa
  FIELD       // Tarla
  SHOP        // Dükkan/İşyeri
}

enum ListingStatus {
  DRAFT
  PENDING
  ACTIVE
  SOLD
  RENTED
  ARCHIVED
}

enum ListingType {
  SALE        // Satılık
  RENT        // Kiralık
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  name          String
  phone         String?
  avatar        String?
  role          Role      @default(USER)
  emailVerified DateTime?
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  listings      Listing[]      @relation("AgentListings")
  favorites     Favorite[]
  comments      Comment[]
  notifications Notification[]
  auditLogs     AuditLog[]
  sessions      Session[]
  searchAlerts  SearchAlert[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expires   DateTime
  ipAddress String?
  userAgent String?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Listing {
  id            String          @id @default(cuid())
  slug          String          @unique
  category      ListingCategory
  type          ListingType
  status        ListingStatus   @default(DRAFT)

  // Çok dilli alanlar
  titleTr       String
  titleEn       String?
  descriptionTr String
  descriptionEn String?

  price         Decimal
  currency      String          @default("TRY")

  // Konum
  city          String          @default("Eskişehir")
  district      String          // ilçe
  neighborhood  String?         // mahalle
  address       String?
  latitude      Float?
  longitude     Float?

  // Ortak özellikler
  area          Float           // m²
  netArea       Float?          // net m²

  // House/Shop özellikleri (nullable, kategoriye göre)
  rooms         String?         // "3+1", "2+1"
  bathrooms     Int?
  buildingAge   Int?
  floor         Int?
  totalFloors   Int?
  heating       String?         // "Doğalgaz", "Kombi", "Merkezi"
  furnished     Boolean?
  hasBalcony    Boolean?
  hasElevator   Boolean?
  hasParking    Boolean?
  hasSecurity   Boolean?
  hasPool       Boolean?
  inSite        Boolean?        // site içinde mi
  facade        String?         // cephe yönü
  creditEligible Boolean?
  deedStatus    String?         // tapu durumu

  // Land/Field özellikleri
  zoningStatus  String?         // imar durumu
  kaks          Float?          // emsal
  taks          Float?
  islandNumber  String?
  parcelNumber  String?

  // Shop özellikleri
  ceilingHeight Float?
  storefrontWidth Float?

  // Genel
  virtualTourUrl String?
  featured      Boolean         @default(false)
  verified      Boolean         @default(false)
  viewCount     Int             @default(0)

  agentId       String
  agent         User            @relation("AgentListings", fields: [agentId], references: [id])

  images        ListingImage[]
  features      ListingFeature[]
  favorites     Favorite[]
  comments      Comment[]
  priceHistory  PriceHistory[]

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([category, type, status])
  @@index([city, district])
  @@index([price])
}

model ListingImage {
  id        String   @id @default(cuid())
  listingId String
  url       String
  order     Int      @default(0)
  alt       String?
  isPrimary Boolean  @default(false)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model ListingFeature {
  id        String  @id @default(cuid())
  listingId String
  key       String  // "air_conditioning", "security_camera" vb. genişletilebilir
  valueTr   String
  valueEn   String?
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model PriceHistory {
  id        String   @id @default(cuid())
  listingId String
  price     Decimal
  changedAt DateTime @default(now())
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  @@unique([userId, listingId])
}

model Comment {
  id        String   @id @default(cuid())
  userId    String
  listingId String
  content   String
  rating    Int?     // 1-5
  approved  Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "new_listing_match", "price_drop", "comment_reply", "favorite_status_change"
  titleTr   String
  titleEn   String?
  body      String
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model SearchAlert {
  id          String   @id @default(cuid())
  userId      String
  name        String
  filters     String   // JSON: { category, type, minPrice, maxPrice, district, rooms, ... }
  frequency   String   @default("instant") // "instant", "daily", "weekly"
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model GalleryItem {
  id          String   @id @default(cuid())
  type        String   // "image" | "video"
  url         String
  thumbnail   String?
  titleTr     String?
  titleEn     String?
  descriptionTr String?
  descriptionEn String?
  category    String?  // "achievement", "event", "office", "team"
  date        DateTime?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String   // "listing.create", "listing.delete", "user.ban", "user.role_change" vb.
  entity     String   // "Listing", "User", "Comment" vb.
  entityId   String?
  metadata   String?  // JSON detay
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model SiteSettings {
  id          Int      @id @default(1)
  contactEmail String
  contactPhone String
  address      String
  workingHours String
  socialLinks  String  // JSON
  aboutTr      String?
  aboutEn      String?
  updatedAt    DateTime @updatedAt
}
```

## 6. Güvenlik Gereksinimleri (Kritik)

1. **Şifre:** Argon2id, min 8 karakter, complexity validation client + server
2. **Admin 2FA zorunlu** — TOTP (otpauth lib)
3. **Rate limiting** — login için 5 deneme / 15 dakika; API genel 100 req/dk per IP
4. **Audit log** — her admin eylemi (ilan ekle/sil/güncelle, kullanıcı ban, rol değişimi) loglanır
5. **RBAC middleware** — `/admin/*` rotaları sadece ADMIN/SUPER_ADMIN
6. **CSRF** — Next.js Server Actions otomatik koruma sağlar, sadakatle Server Action kullan
7. **Dosya upload** — MIME type check, max 10MB foto, max 50MB video, sharp ile yeniden encode et (EXIF temizle, polyglot saldırı önle)
8. **Input validation** — TÜM girdiler Zod ile şema doğrulaması
9. **SQL injection** — Sadece Prisma, asla raw query
10. **XSS** — React zaten escape ediyor, `dangerouslySetInnerHTML` kullanma
11. **Session** — HttpOnly + Secure + SameSite=Lax cookie
12. **Env yönetimi** — `.env` git'te değil, VPS'te ayrı

## 7. Yol Haritası — 6 Faz

### Faz 1: Temel Altyapı ✅ İLK YAPILACAK
- [x] Next.js 16 + TS + Tailwind v4 kurulum (Turbopack default)
- [x] `package.json` scripts'e `--turbopack` ekle (dev + build)
- [x] `src/app/globals.css`'e `@theme` ile tasarım sistemi renkleri + fontları
- [x] Playfair Display + Inter `next/font/google` ile yükle
- [x] shadcn/ui init (CLI Tailwind v4'ü destekliyor)
- [x] Prisma + SQLite kurulum, ilk migration
- [x] next-intl kurulum, tr/en mesaj dosyaları
- [x] Auth.js v5 (email/şifre + Google)
- [x] Argon2 password hashing
- [x] Layout, Header (logo+menü), Footer
- [x] Ana sayfa hero + featured listings placeholder
- [x] `.env.example`, README

### Faz 2: İlan Sistemi Çekirdeği ✅ TAMAMLANDI
- [x] `prisma/seed.ts` — SUPER_ADMIN + SiteSettings seed scripti (`npm run db:seed`)
- [x] Route grupları `[locale]/(public)/` ve `[locale]/(auth)/` kuruldu
- [x] `public/uploads/` klasörü oluşturuldu
- [x] `DATABASE_URL` düzeltildi (`file:./prisma/dev.db`), migration yeniden uygulandı
- [x] `src/lib/validations/listing.ts` — Zod şeması (Listing create/update)
- [x] `src/lib/slug.ts` — slug otomatik üretimi helper
- [x] Admin ilan CRUD: `src/app/[locale]/admin/ilanlar/` — liste, yeni ilan formu, düzenleme
- [x] Sharp ile fotoğraf upload API: `src/app/api/upload/route.ts`
- [x] İlan listeleme sayfası (`/ilanlar`) — filtre + sayfalama
- [x] İlan detay sayfası (`/ilan/[slug]`) — galeri, özellikler, harita placeholder
- [x] Görüntülenme sayacı (Server Action)
- [x] Giriş sayfası (`/giris`) — e-posta/şifre formu, hata mesajları
- [x] Kayıt sayfası (`/kayit`) — yeni kullanıcı oluşturma
- [x] Kayıt API: `src/app/api/auth/register/route.ts`

### Faz 3: Gelişmiş Arama ✅ TAMAMLANDI
- [x] Dinamik filtre paneli (kategori bazlı alanlar) — `filter-panel.tsx` + `filter-sheet.tsx`
- [x] URL search params senkronu — `filter-utils.ts` + `use-listing-filters.ts`
- [x] Eskişehir ilçe/mahalle veri seti (JSON statik) — `eskisehir-locations.json` + `eskisehir.ts`
- [x] Mobil filtre bottom sheet — `@radix-ui/react-dialog` ile implementasyonu
- [x] Leaflet harita ilanlar üzerinde — `listing-map.tsx` + `view-toggle.tsx`, `?gorunum=harita` URL param
- [x] Çoklu görsel carousel (ilan detay sayfası) — `listing-gallery.tsx`, hero içinde thumbnail strip + prev/next
- [x] Upload UI ilan formuna entegrasyon — `image-uploader.tsx` dropzone + thumbnail grid, `saveListingImages` action
- [x] Arama önerileri → Benzer İlanlar olarak implemente edildi (`similar-listings.ts` + `similar-listings.tsx`)

### Faz 4: Kullanıcı Etkileşimi ✅ TAMAMLANDI
- [x] Favori sistemi — `toggleFavorite` Server Action + `FavoriteButton` + ListingCard + ilanlar sayfası
- [x] Yorum sistemi (admin moderasyonlu) — `CommentForm` + `CommentList` + `/admin/yorumlar`
- [x] Bildirim merkezi (in-app) — `NotificationDropdown` + `HeaderWrapper` server split
- [x] Profil sayfası — favoriler listesi + yorumlar listesi
- [x] Paylaş butonları — WhatsApp / X / link kopyala + Open Graph + Twitter Card meta
- [x] Arama alarmları (SearchAlert) + cron job (node-cron) — `instrumentation.ts` + `lib/cron.ts`, her gün 22:00
- [x] Email bildirimleri (Resend) — `lib/email.ts`, yorum onayı + alarm eşleşmesi
- [x] Rate limiting — `lib/rate-limit.ts`: login 5/15dk (auth.ts), kayıt 3/10dk (register API)

### Faz 4 ✅ TAMAMLANDI + Bug Fix Turu ✅

Post-Faz-4 düzeltmeleri (12 madde):
- [x] Yorumlar anında yayınlanıyor (`approved: true` default) — admin sadece silebilir
- [x] Ana sayfa `[locale]/(public)/page.tsx`'e taşındı → Header/Footer çalışıyor
- [x] Ana sayfa: öne çıkan ilanlar DB'den çekiliyor + arama butonu navigate ediyor
- [x] Header: çıkış butonu (desktop + mobile) eklendi
- [x] 404 sayfası (`[locale]/not-found.tsx`) tasarım diliyle oluşturuldu
- [x] Mobile `/ilanlar`: tek sticky toolbar (FilterMobileTrigger + SortSelect + ViewToggle)
- [x] Admin panel mobil: `AdminShell` (client, hamburger toggle) + overlay sidebar
- [x] `DialogContent` accessibility: `<Dialog.Title className="sr-only">` eklendi
- [x] Admin form `<select>` seçenekleri görünür (`bg-navy-800 [&>option]:bg-navy-800`)
- [x] Galeri: tam ekran lightbox (Escape/klavye/thumbnail strip)
- [x] İlan detay harita: Leaflet gerçek harita, placeholder kaldırıldı
- [x] Arama Alarmı: `/ilanlar` sayfasında aktif filtrelerle `SearchAlertInline`

### Faz 5: Admin Paneli ✅ TAMAMLANDI
- [x] Dashboard (Recharts grafikler) — 6 istatistik kartı + AreaChart + PieChart + BarChart
- [x] İlan yönetimi gelişmiş — metin/status/kategori filtresi + featured toggle + toplu işlem (aktif/arşiv/sil)
- [x] Kullanıcı yönetimi — rol değişimi (USER→AGENT→ADMIN) + ban/unban, audit log
- [x] Yorum moderasyonu gelişmiş — görünür/gizle toggle + filtre sekmeler (Tümü/Yayında/Gizli)
- [x] Galeri yönetimi — GalleryItem CRUD, foto+video upload, sıralama (yukarı/aşağı)
- [x] İletişim mesajları — okundu işaretleme, filtreleme (okunmamış/okunmuş), silme
- [x] Audit log görüntüleyici — action/entity filtreli tablo, 50/sayfa sayfalama
- [x] Site ayarları — SiteSettings form (iletişim, sosyal linkler JSON, hakkımızda)
- [x] 2FA kurulum akışı — TOTP (otpauth) QR setup + login sonrası doğrulama (signed cookie)

### Faz 6: Sayfalar + Cila + Deployment
- [x] Hakkımızda sayfası — SiteSettings + DB team listesi, istatistikler, değerler, CTA
- [x] İletişim sayfası + form + harita — `submitContact` Server Action + rate limit + Leaflet ofis haritası
- [x] Galeri/Anılar sayfası — masonry grid, filtre sekmeleri, fotoğraf lightbox, YouTube/Vimeo video modal
- [x] SEO: sitemap.xml, robots.txt, Schema.org RealEstateListing JSON-LD (ilan detayda)
- [x] OpenGraph + Twitter Cards — tüm yeni sayfalarda `generateMetadata` eklendi
- [x] KVKK aydınlatma + cookie consent banner (`localStorage` tabanlı)
- [x] Kullanım koşulları (`/kosullar`) + gizlilik politikası (`/gizlilik`)
- [ ] Performance audit (Lighthouse 90+)
- [ ] Accessibility (WCAG AA)
- [ ] VPS kurulum: Nginx + PM2 + Certbot
- [ ] Backup stratejisi (cron + rsync SQLite snapshot)

## 8. Tasarım Sistemi

**Renkler (logodan):**
- Primary navy: `#0A1F3A`
- Navy darker: `#061629`
- Gold primary: `#D4A744`
- Gold light: `#E5C77A`
- Silver accent: `#C0C5CC`
- Background: `#0E2545`
- Text on dark: `#F5F1E8`

**Tipografi:**
- Başlık (serif lüks): "Playfair Display" veya "Cormorant Garamond"
- Gövde (sans): "Inter" veya "Manrope"

**Component referansları:** Yüklenen 10 görsel — özellikle Luxe Estates web + mobil ve Luna Estates signup.

## 9. Deployment Notları

```bash
# VPS'te ilk kurulum (Ubuntu 22.04+)
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
# Node 20.9+ gerekli (Next.js 16 minimum)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Proje deploy
git clone <repo>
cd guleryuz
npm ci
npx prisma migrate deploy
npm run build
pm2 start ecosystem.config.js
pm2 save && pm2 startup

# Nginx reverse proxy: port 3000 → 80/443
# Certbot ile SSL
sudo certbot --nginx -d guleryuzgayrimenkul.com -d www.guleryuzgayrimenkul.com
```

**Backup:** SQLite dosyasını her gece S3-compatible storage (Cloudflare R2 / Backblaze B2) veya başka VPS'e rsync.

## 10. Sonraki Adım

**Faz 6 A aşaması tamamlandı (2026-05-21).** Faz 6 B (deployment) sırada.

Faz 6 B öncelik sırası:
1. **`ecosystem.config.js`** — PM2 config (instances: 1, watch: false, restart policy)
2. **`README.md`** — kurulum talimatları (VPS, env, seed, nginx, pm2, certbot)
3. **VPS Deployment** — Nginx + PM2 + Certbot, rate limiting (Nginx seviyesi 100 req/dk per IP)
4. **Backup** — cron script (SQLite → Cloudflare R2 / Backblaze B2, her gece)
5. **Performance** — Lighthouse 90+ audit, LCP görsellerine `priority` prop
6. **Logo + Hero fotoğrafı** — `/public/brand/logo.svg` + `/public/images/hero-bg.jpg`

---

## Çalışma Prensipleri (Claude Code için)

- Tüm yorumları ve UI metnini Türkçe yaz (kod isimleri İngilizce)
- Server Components varsayılan, sadece gerektiğinde `"use client"`
- Server Actions tercih et (form submit, mutation)
- Her yeni özellik için Zod şeması ÖNCE
- Her admin endpoint'inde `auth()` kontrolü + role check
- Önemli aksiyon = audit log
- Migration'ları KESİNLİKLE elle düzenleme, `prisma migrate dev --name xxx` kullan
- Her faz sonunda bu CLAUDE.md'yi güncelle

### Next.js 16 Özel Notlar (ÖNEMLİ)

- **Middleware dosya adı: `src/middleware.ts`** (standart Next.js, `proxy.ts` değil). next-intl middleware + ileride auth guard eklenecek.
- **Async params zorunlu**: Tüm dinamik route'larda (`[locale]`, `[slug]`, `[id]`) params artık Promise:
  ```ts
  export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
  }
  ```
  `searchParams` ve `cookies()`, `headers()` de aynı şekilde async.
- **Cache opt-in**: Default'ta hiçbir fetch/component cache'lenmiyor. Cache istediğin yerde dosya/fonksiyon başına `"use cache"` koy. İlan detay sayfası, featured listings gibi yerlere ekle:
  ```ts
  "use cache";
  export async function getFeaturedListings() { ... }
  ```
  Auth-bağlı veya kullanıcıya özel veriyi ASLA cache'leme.
- **Turbopack default**: Hızlı dev experience için `next dev --turbopack` ve `next build --turbopack` kullan. Webpack özel pluginler gerekirse opt-out edilebilir.
- **React Compiler stable**: `next.config.ts`'te `experimental.reactCompiler = true` aç. `useMemo`/`useCallback` çoğunlukla gereksiz, compiler hallediyor. Manuel memoization sadece kanıtlanmış bottleneck'lerde.
- **`next/image` default değişiklikleri**: Quality default 75, formats default `[image/webp]`. Eskişehir fotoğrafları için optimize, daha agresif lazy loading.
- **Node.js minimum 20.9+** — VPS'te Node 22 LTS kuracağız.
- **Tailwind CSS v4 (CSS-first config)**: `tailwind.config.ts` artık kullanılmıyor (veya minimal). Tüm tema `src/app/globals.css` içinde `@theme { ... }` bloğu altında CSS değişkenleri olarak tanımlanıyor:
  ```css
  @import "tailwindcss";
  @theme {
    --color-navy-900: #0A1628;
    --color-gold-500: #D4A744;
    --font-display: "Playfair Display", serif;
  }
  ```
  Bu tanım `bg-navy-900`, `text-gold-500`, `font-display` utility class'larını otomatik üretir. DESIGN_SYSTEM.md'de tam liste var.
- **shadcn/ui Tailwind v4 desteği**: CLI v4'ü destekliyor (`npx shadcn@latest init` v4'ü algılar). Component'ler CSS variable tabanlı çalışır.

---

## 11. Karar Geçmişi

Faz 1'de planlananın dışına çıkan veya dikkat gerektiren teknik kararlar:

### Prisma 7.x — Yeni Mimari (Planlanmamıştı)
- Kurulan sürüm **Prisma 7.8.0** (planlanan 5.x/6.x değil).
- Yeni config: `prisma.config.ts` (datasource URL buradan okunuyor), `schema.prisma`'da `url` yok.
- Generator: `provider = "prisma-client"` + `output = "../src/generated/prisma"` → import yolu `@/generated/prisma/client`.
- **SQLite için zorunlu driver adapter:** `@prisma/adapter-better-sqlite3` + `better-sqlite3` paketi kuruldu. `new PrismaClient({ adapter })` ile başlatılıyor.
- `dotenv` paketi `prisma.config.ts` için dev bağımlılığı olarak eklendi.

### @node-rs/argon2 (argon2 yerine)
- CLAUDE.md'de `argon2` paketi planlanmıştı; Windows geliştirme ortamında node-gyp native build sorunu yaşanabileceğinden **`@node-rs/argon2`** (Rust tabanlı, NAPI) tercih edildi.
- API aynı: `hash()` + `verify()`. VPS'te (Linux) da sorunsuz çalışır.
- CLAUDE.md Bölüm 3'teki "Şifre hash: `argon2` paketi" notu güncellenmeli.

### Auth.js v5 — JWT Strateji (Database Adapter Kullanılmadı)
- Prisma 7 driver adapter ile `@auth/prisma-adapter` uyumluluğu belirsiz olduğundan **JWT strateji** seçildi.
- Oturumlar cookie'de (HttpOnly JWT), DB'de Session tablosu şimdilik kullanılmıyor.
- Google OAuth: yalnızca DB'de kaydı olan e-posta ile giriş yapılabiliyor (`signIn` callback ile kontrol).
- `AUTH_SECRET` `.env`'de mevcut; `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` henüz boş.

### shadcn/ui — Manuel Kurulum
- `npx shadcn@latest init` interaktif olduğu için `components.json` manuel oluşturuldu.
- `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`, `@radix-ui/react-slot` elle kuruldu.
- `button.tsx`, `input.tsx`, `card.tsx` `npx shadcn@latest add … --yes` ile eklendi.
- `globals.css`'e shadcn CSS değişken katmanı eklendi (`--color-primary` → gold-500, `--color-card` → navy-850 vb.).

### middleware.ts (proxy.ts değil)
- CLAUDE.md'de `src/proxy.ts` yazıyordu; Next.js standart middleware dosyası `src/middleware.ts`'dir. Düzeltildi.

### next-intl Navigation Helper
- `src/i18n/navigation.ts` — `createNavigation(routing)` ile locale-aware `Link`, `usePathname`, `useRouter` export edildi.
- Tüm iç linkler bu `Link` component'inden geçiyor.

### Hero — Geçici CSS Gradient Arka Plan
- Referans tasarımda (06-web-home-hero.png) tam sayfa property fotoğrafı var.
- Faz 1'de gerçek fotoğraf olmadığından `radial-gradient` CSS arka plan kullanıldı.
- Faz 2'de `/public/images/hero-bg.jpg` eklenince `next/image` + overlay ile değiştirilecek.

### Sosyal Medya İkonları — Geçici
- `lucide-react` Instagram / Facebook / YouTube ikonları içermiyor.
- Footer'da geçici olarak `Camera`, `Users`, `Play` ikonları kullanıldı.
- Kalıcı çözüm: `@iconify/react` veya inline SVG. Faz 6'da yapılacak.

### DATABASE_URL Path Düzeltmesi (Faz 2 başı)
- `.env`'de `file:./dev.db` → proje köküne yazıyordu; `db.ts` `prisma/dev.db` bekliyordu.
- Düzeltme: `DATABASE_URL="file:./prisma/dev.db"` — artık her iki taraf `prisma/dev.db` kullanıyor.
- Migration yeniden uygulandı: `20260519113028_init`.

### tsx + db:seed Script (Faz 2)
- `tsx` devDependency olarak kuruldu (TypeScript seed çalıştırma).
- `package.json`'a `"db:seed": "tsx prisma/seed.ts"` scripti ve `"prisma": { "seed": "..." }` eklendi.
- Seed admin: `admin@guleryuzgayrimenkul.com` — üretimde şifre değiştirilmeli.

### Faz 2: Sharp + WebP Görsel Pipeline
- Upload API (`/api/upload`) doğrudan WebP'e dönüştürüyor; orijinal dosya disk'e yazılmıyor.
- 3 çıktı: full (1920×1080 max, quality 82), thumbnail (480×360 crop, quality 70), DB kaydı.
- `sharp().metadata()` ile gerçek görsel doğrulaması yapılıyor (MIME spoof koruması).
- EXIF otomatik temizleniyor (`.rotate()` yönteminin yan etkisi).
- Dosyalar `/public/uploads/{hex}.webp` ve `/public/uploads/{hex}_thumb.webp` olarak kaydediliyor.

### Faz 2: Server Component vs Client Component Ayrımı
- `ilanlar/page.tsx` Server Component — `onChange` event handler geçirilemez.
- Sıralama `<select>`'i ayrı `SortSelect` Client Component'ine çıkarıldı (`src/components/listing/sort-select.tsx`).
- Kural: Server Component'ten Client Component'e geçen her prop serileştirilebilir olmalı (fonksiyon geçirilemez).

### Faz 2: Zod v4 + react-hook-form Uyum Sorunu
- `@hookform/resolvers` v5 kuruldu (Zod v4 için zorunlu).
- `zodResolver(schema)` dönüş tipi `Resolver<T>` ile uyumsuz; `as any` cast gerekiyor.
- `onSubmit = async (data: any)` — form submit handler'da da tip cast gerekiyor.
- Bu bilinen bir upstream sorunu; `@hookform/resolvers` yeni sürümüyle düzelecek.

### Faz 2: View Counter StrictMode Koruması
- React StrictMode dev modunda effect'leri çift çalıştırıyor.
- `useRef(false)` + `called.current = true` pattern ile ilk render'da tek increment garantilendi.
- Prod'da StrictMode çift çalışmaz; bu yalnızca dev kalitesini korumak için.

### Faz 2: Admin Silme Butonu — İki Adımlı Onay
- `DeleteListingButton` — ilk tıkta "Emin misin?" moduna geçiyor, 3 saniye sonra sıfırlanıyor.
- İkinci tıkta `deleteListing(id)` Server Action çağrılıyor.
- `useTransition` ile optimistik UI: buton disabled + spinner gösteriliyor.

### Faz 2: Auth redirect Locale Prefix
- `src/lib/auth.ts`'te `pages.signIn: "/tr/giris"` hardcoded.
- Çok dilli senaryoda `/en/login` desteği gerekirse locale-aware redirect yazılmalı (Faz 6).

### Faz 3: Eskişehir Lokasyon Hiyerarşisi — Static JSON
- İlçe/mahalle verileri DB tablosu yerine `src/lib/data/eskisehir-locations.json` olarak tutuldu.
- Sebep: Eskişehir odaklı proje, başka şehir eklenmeyecek; veri değişmez; admin CRUD UI gereksiz; JSON daha hızlı (DB round-trip yok); version-controlled.
- `eskisehir.ts` — JSON'dan `ESKISEHIR_DISTRICTS`, `getNeighborhoods(district)`, `ESKISEHIR_LOCATIONS` türetiliyor.
- 14 ilçe, Odunpazarı 28 mahalle + Tepebaşı 27 mahalle + 12 kırsal ilçe.

### Faz 3: Filter Utils — Server/Client Boundary Ayrımı
- `"use client"` olan bir dosyadan export edilen saf fonksiyonlar Server Component'te kullanılamaz.
- Çözüm: `src/lib/filter-utils.ts` — `"use client"` YOK; `FilterState`, `parseFiltersFromUrl`, `buildFilterUrl`, `countActiveFilters` burada.
- `src/hooks/use-listing-filters.ts` — `"use client"` sadece buraya; `useListingFilters()` hook + `filter-utils.ts`'ten re-export.
- `ilanlar/page.tsx` (Server Component) → `filter-utils.ts`'ten import eder.
- `filter-panel.tsx` (Client Component) → `filter-utils.ts` + `use-listing-filters.ts` ikisinden de import edebilir.

### Faz 3: Benzer İlanlar — "use cache" + In-Memory Scoring
- `getSimilarListings(params)` — `src/lib/similar-listings.ts`, `"use cache"` direktifi fonksiyon içinde.
- Cache key: fonksiyon referansı + params (id, category, type, district, price, rooms). Aynı ilan → cache hit.
- Prisma Decimal cache güvenliği: DB'den çekip `.toNumber()` yaptıktan sonra `number` olarak döndürülüyor. Böylece RSC serializasyonu sorunsuz.
- ListingCard adapter: `getSimilarListings` → `price: number`; ListingCard `price: { toNumber(): number }` bekliyor → `{ toNumber: () => price }` wrapper.
- Skor: aynı ilçe +3, kentsel komşu (Odunpazarı↔Tepebaşı) +1, fiyat ±%15 +2, aynı oda +2, ±1 oda +1.
- Query: kategori+tip+durum sabit filtre, fiyat ±%30 aralığı, take 30, in-memory sort → top 4.
- Yeni index gerekmedi — mevcut `[category, type, status]` + `[price]` indexleri yeterli.

### Faz 3: Filtre Paneli Mimarisi
- Local state (`useState<FilterState>`) → "Ara" butonu → `router.push(buildFilterUrl(state))` → Server Component yeni searchParams ile yeniden render → Prisma sorgusu.
- Multi-select alanlar (districts, rooms): URL'de tekrar eden key: `?ilce=Odunpazarı&ilce=Tepebaşı`. Parse: `params.getAll("ilce")`. Build: `p.append("ilce", d)`.
- İlçe değişince mahalle sıfırlanır: `toggleArray("districts", d)` içinde `neighborhoods: []` reset.
- Koşullu mahalle bölümü: yalnızca `state.districts.length === 1` ve seçili ilçenin mahallesi varsa görünür.
- Mobil: `@radix-ui/react-dialog` bottom sheet, max-h-[88vh], drag handle.
- Desktop: `<aside hidden lg:flex>` sticky sidebar.
- Suspense boundary zorunlu (`useSearchParams()` App Router gereksinimi).

### Faz 3: Leaflet Harita — SSR Sorunu ve Çözümü
- `react-leaflet` tarayıcı DOM API'sine bağımlı, Node.js'te çalışmaz → `ssr: false` zorunlu.
- Next.js 16 kısıtı: `next/dynamic` ile `ssr: false` **yalnızca Client Component içinde** kullanılabilir.
- Çözüm: `listing-map-client.tsx` (`"use client"`) → `dynamic(() => import('./listing-map'), { ssr: false })`. Page.tsx bu wrapper'ı import eder.
- Leaflet popup CSS override: Leaflet'in kendi DOM tree'sine inject ettiği için Tailwind class'ları çalışmaz. `<style>` tag ile inline CSS kullanıldı.
- `leaflet/dist/leaflet.css` import'u sadece Client Component'te yapılmalı.

### Faz 3: View Toggle — URL Param Yaklaşımı
- `?gorunum=harita` URL parametresi ile liste ↔ harita geçişi. Client state yok.
- `ViewToggle` component prop tabanlı (`listUrl`, `mapUrl`, `currentView`) — hooks yok, Server Component olarak çalışıyor.
- URL'de olduğu için back button çalışır, filtreler korunur, SEO dostu.
- Harita görünümünde sayfalama anlamsız: koordinatı olan tüm aktif ilanlar çekiliyor (max 200), `take` parametresi harita için yüksek tutuldu.
- Decimal → number dönüşümü harita veri hazırlamada kritik (RSC serializasyonu + `"use cache"` uyumu).

### Faz 4: Header Server/Client Split

- `header.tsx` artık `"use client"` + `user`, `notifications`, `unreadCount` prop'ları alıyor.
- `header-wrapper.tsx` Server Component — `auth()` + `db.notification.findMany()` burada çalışıyor, sonuçları Header'a prop olarak geçiriyor.
- `(public)/layout.tsx` artık `<Header />` yerine `<HeaderWrapper />` render ediyor.
- Sebep: Client Component içinde `auth()` çağrılamaz; server/client boundary net ayrım gerekiyor.

### Faz 4: Favori Sistemi

- `toggleFavorite(listingId)` Server Action: `Favorite.@@unique([userId, listingId])` ile `findUnique` + `delete`/`create` pattern.
- `FavoriteButton`: `useTransition` + optimistic state — sunucu yanıtını beklemeden UI anında güncellenir.
- Giriş yapılmamış kullanıcı favorilemeye çalışırsa `/giris`'e yönlendirme (catch bloğunda).
- `ilanlar/page.tsx`: tek sorguda tüm kullanıcı favorileri çekilip `Set<string>` yapılıyor, her karta `isFavorited` prop'u geçiliyor.

### Faz 4: Yorum Sistemi

- `createComment` Server Action: `approved: true` ile kaydedilir (anında yayın). Başta `false` planlanmıştı; butik ofis modeli için onay adımı kaldırıldı.
- `deleteComment` sadece ADMIN/SUPER_ADMIN rolüne açık; `approveComment` bırakıldı (DB'de eski `false` kayıtlar varsa hâlâ işe yarar).
- `/admin/yorumlar` — tüm yorumlar tek listede, sadece sil aksiyonu.
- CommentList `where: { approved: true }` ile filtreliyor (default `true` olduğundan tüm yeni yorumlar görünür).

### Faz 4: Open Graph + Paylaş

- `generateMetadata` export — ilan detay sayfasında OG ve Twitter Card tag'leri üretiyor.
- `NEXT_PUBLIC_BASE_URL` env var ile canonical URL; fallback `https://guleryuzgayrimenkul.com`.
- ShareButtons: `wa.me/?text=` + `x.com/intent/tweet` + `navigator.clipboard.writeText` (copy link).
- Instagram paylaşımı link-based desteklenmiyor (mobil uygulama gerektirir), bu nedenle atlandı.

### Faz 4: Rate Limiting — In-Memory

- `src/lib/rate-limit.ts`: process-level `Map` tabanlı rate limiter.
- Login: 5 deneme / 15 dk per email (`auth.ts` authorize callback).
- Kayıt: 3 deneme / 10 dk per IP (`/api/auth/register` POST).
- VPS'te PM2 `instances: 1` kullanılacağından in-memory yeterli. Multi-instance gerekirse Redis'e migrate edilebilir.
- Otomatik temizleme: `setInterval` her 5 dk'da 30 dk süresi dolmuş kayıtları siliyor.

### Faz 4: Email — Resend + Graceful No-op

- `resend@6.12.3` paketi; `RESEND_API_KEY` boşsa `resend = null` → tüm fonksiyonlar sessizce return eder (dev'de hata yok).
- `RESEND_FROM_EMAIL` env var; fallback `noreply@guleryuzgayrimenkul.com`.
- Şablonlar `src/lib/email.ts`'te inline HTML (navy/gold tema):
  - `sendCommentApprovedEmail` — yorum onayı bildirimi (şu an kullanılmıyor, `approved: true` default olduğundan)
  - `sendSearchAlertEmail` — alarm eşleşmesi ile {N} ilan listesi
- Üretimde `RESEND_API_KEY` `.env`'e eklenecek.

### Faz 4: SearchAlert + Cron Job

- `node-cron@4.2.1` + Next.js `instrumentation.ts` (server startup hook).
- `instrumentation.ts` → `register()`: `NEXT_RUNTIME === "nodejs"` koşuluyla çalışır, Edge'de değil.
- Her gün **22:00 Europe/Istanbul** timezone'unda `checkSearchAlerts()` tetiklenir.
- `lib/cron.ts` mantığı: her aktif SearchAlert için frekansa göre tarih aralığı (daily: -1gün, weekly: -7gün) → Prisma sorgu → eşleşme varsa in-app `Notification` + `sendSearchAlertEmail`.
- **NOT:** "instant" frequency şu an günlük cron'a düşüyor. Gerçek anlık tetikleme için `createListing` Server Action'a `checkSearchAlerts(listingId)` hook eklenebilir (Faz 5 opsiyonu).

### Faz 4: Admin Panel Mobil — AdminShell Pattern

- `AdminLayout` (Server Component) → `AdminShell` (Client Component) aracılığı.
- Neden ayrı component: sidebar toggle state client-side, layout server-side; ikisi karıştırılamaz.
- `AdminShell`: mobile topbar (hamburger) + `fixed` overlay + `translate-x` slide-in sidebar; `lg:` breakpoint'te klasik `flex` düzeni.
- `AdminSidebar.onNavigate` prop: nav linkine tıklayınca mobil sidebar kapanır.

### Faz 4: Navigasyon Butonu — Harita Popup

- Her Leaflet popup'ına ve ilan detay konum başlığına Google Maps "Yol Tarifi Al" linki eklendi.
- URL: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}` — mobilde Maps uygulamasını açar.
- Popup'ta iki buton yan yana: "İlanı Gör" (gold filled) + "Yol Tarifi" (gold outlined).
- İlan detayında konum başlığının sağında küçük pill buton.

### Faz 5: 2FA — Cookie-Based Enforcement (Auth.js Bypass)

- Auth.js v5 JWT session'ı orta adımda "upgrade" etmek mümkün değil; ortak kalıp cookie-based 2FA doğrulaması.
- `guleryuz-2fa-verified` cookie: `{userId}|{exp}|{hmac}` — HMAC-SHA256 ile `AUTH_SECRET` imzalı.
- `guleryuz-2fa-setup` cookie: setup sırasında geçici secret saklanır (10 dk TTL), `{userId}|{secretBase32}|{hmac}`.
- Admin layout: `headers()` ile `x-pathname` okunur → eğer `/2fa-dogrula` rotasındaysak redirect yapılmaz (sonsuz döngü önlemi).
- `src/proxy.ts` middleware: `intlMiddleware(req)` sonraki yanıta `x-pathname` header ekler.
- TOTP: `otpauth` kütüphanesi, SHA1, 6 hane, 30s dönem. `window: 1` ile ±1 periyot toleransı.
- QR kod: `qrcode` ile SVG data URL, navy/gold renk — setup page'de `<Image>` ile gösterilir.
- Sadece ADMIN/SUPER_ADMIN rolü için zorunlu; AGENT etkilenmiyor.
- 2FA etkinken logout (veya 8 saat TTL dolması) → tekrar doğrulama gerekir.

### Faz 5: form `action` + Server Action Dönüş Tipi

- `form action` prop tipi `(formData: FormData) => void | Promise<void>` — `ActionResult` döndüren Server Action doğrudan geçilemiyor.
- **DOĞRU ÇÖZÜM:** `deleteGalleryItem`, `moveGalleryItem`, `markMessageRead`, `deleteMessage` action'larının dönüş tipi `Promise<void>` olarak değiştirildi.
- `.bind()` pattern geçerliliğini koruyor: `action={deleteGalleryItem.bind(null, item.id)}` — server action referansı serileştirilebilir.
- `async () => { await serverAction(...) }` wrapper KULLANMA — bunlar Server Action değil, anonim fonksiyondur.

### Faz 5: Dashboard — Parallel Query Mimarisi

- `Promise.all([...11 sorgu...])` ile tek round-trip.
- Cache yok (real-time dashboard uygun, auth-bağlı veri).
- `buildDailyData()`: son 7 gün `Date` array'den istemci tarafında aggregation — DB'de GROUP BY yerine JS'de sayma (küçük dataset için yeterli).
- Recharts: `DashboardCharts` Client Component. `AreaChart` (7 günlük aktivite) + `PieChart` (kategori dağılımı) + `BarChart` (durum dağılımı). Renk paleti: `COLORS = ["#D4A744", "#60A5FA", "#4ADE80", "#C084FC"]`.

### Faz 5: 2FA — Zorunlu Enforcement (Güncellenmiş)

- 2FA kurulmamış ADMIN/SUPER_ADMIN → `/admin/2fa-kurulum` yönlendirmesi (artık zorunlu).
- 2FA kurulmuş ama cookie doğrulanmamış → `/admin/2fa-dogrula` yönlendirmesi.
- Bypass listesi: `isOnVerifyPage || isOnSetupPage` — sonsuz döngü önlemi.
- AGENT rolü 2FA sayfalarına erişirse → `/admin`'e yönlendirilir.
- Kütüphane: `otpauth` (TOTP, SHA1, 6 hane, 30s) + `qrcode` (SVG data URL).
- Backup kod yok — sadece TOTP uygulaması (Authenticator) ile giriş.

### Faz 5: Audit Log Mimarisi

- `lib/audit.ts` — tek `auditLog()` yardımcı fonksiyonu. `try/catch` ile hataları yutarak ana akışı kesmez.
- Sadece Server Action'lardan çağrılır (sayfa component'lerinden değil).
- IP: `x-forwarded-for` header (Nginx proxy arkasında doğru IP için).
- **Loglanmayan aksiyonlar artık yok** — tüm admin CRUD işlemleri loglanıyor:
  - `listing.*`: create, update, delete, status_change, toggle_featured, bulk_{action}
  - `user.*`: role_change, ban, unban
  - `comment.*`: hide, approve, delete
  - `gallery.*`: create, delete
  - `settings.update`, `2fa.enabled`, `2fa.disabled`

### Faz 5: RBAC Implementasyonu — 3 Katman

- **Katman 1 — Layout:** `admin/layout.tsx` AGENT/ADMIN/SA kontrolü + 2FA zorunluluğu.
- **Katman 2 — Sayfa:** Hassas sayfalar (kullanicilar, yorumlar, galeri, iletisim, audit-log, ayarlar, 2fa-kurulum) kendi `auth()` + ADMIN/SA kontrolüyle korunuyor.
- **Katman 3 — Server Action:** Her action kendi `getAdminUser()` / `getAuthorizedUser()` çağrısıyla bağımsız korunuyor.
- Middleware'de RBAC yok — next-intl middleware locale routing yapıyor, auth guard layout'ta.

### Faz 5: Session Callback DB Kontrolü (Ban Anında Etkili)

- `auth.ts` `session` callback artık `async` — her `auth()` çağrısında DB'den `banned` + `role` yeniden okunuyor.
- Banlı kullanıcı: `{ expires: session.expires }` döndürülüyor (user yok) → tüm `session?.user` kontrolleri null yakalar.
- Yan fayda: Rol değişimleri de anında etkili (JWT yenilemesi beklemiyor).
- Tradeoff: Her `auth()` çağrısında 1 ekstra DB sorgusu. Küçük site için kabul edilebilir.

### Faz 5: Upload API Rate Limiting

- `/api/upload` POST handler'a rate limit eklendi: 30 yükleme/saat per user ID.
- `checkRateLimit(`upload:${session.user.id}`, 30, 3600000)` — `rate-limit.ts`'teki in-memory limiter kullanılıyor.
- 429 döndürüldüğünde hata mesajı: "Çok fazla yükleme isteği. Lütfen bir saat bekleyin."

### Faz 6: Public Sayfalar + SEO

- **Hakkımızda** — `SiteSettings.aboutTr` + DB'den `role IN [SUPER_ADMIN, ADMIN, AGENT]` kullanıcılar. Avatar yoksa ismin ilk harfi gold renkte gösteriliyor.
- **İletişim** — `submitContact()` Server Action `contact.ts`'e eklendi. Rate limit: 3 mesaj/saat per IP. `ContactForm` (client) + `OfficeMapClient` (Leaflet ssr:false pattern). `contactSchema` — `src/lib/validations/contact.ts`.
- **Galeri** — `GalleryClient` masonry CSS `columns-1 sm:columns-2 lg:columns-3` + filtre sekmeleri + fotoğraf lightbox + YouTube/Vimeo embed modal (getYoutubeId/getVimeoId helper). Video yoksa `<video>` tag fallback.
- **sitemap.ts** — Next.js `MetadataRoute.Sitemap` API, aktif ilanlar dinamik, statik sayfalar sabit. `NEXT_PUBLIC_BASE_URL` env var.
- **robots.ts** — `/admin/*` ve `/api/*` disallow, sitemap pointer.
- **Schema.org JSON-LD** — `RealEstateListing` + `Offer` + `PostalAddress` + `GeoCoordinates` + `floorSize` — ilan detay sayfasında `<script type="application/ld+json">`.
- **Cookie consent** — `localStorage` tabanlı `CookieBanner` client component, public layout'a eklendi. Key: `guleryuz-cookie-consent`.
- **env tutarsızlığı düzeltildi** — `.env.example`'da `NEXT_PUBLIC_SITE_URL` → `NEXT_PUBLIC_BASE_URL` olarak güncellendi (kod ile uyumlu).
- **next.config.ts** — `images.formats: ["image/webp"]` + `minimumCacheTTL: 31536000` eklendi. React Compiler paket gerektirdiğinden eklenmedi (opsiyonel: `npm install babel-plugin-react-compiler` + `reactCompiler: true` root seviyede).
- **`/kullanim-kosullari`** — fazladan oluşturuldu (silinmedi), `/kosullar` footer ile uyumlu asıl sayfa.

### Faz 5: Admin İlan Listesi Sayfalama

- `admin/ilanlar/page.tsx`'e `PAGE_SIZE = 50` + `skip` + `take` eklendi.
- Toplam kayıt: `Promise.all([findMany, count])` ile paralel sorgu.
- URL parametresi: `?sayfa=N` — filtreler korunarak sayfalama çalışıyor.
- `buildUrl(page)` helper: mevcut filtreleri URL'ye dahil ediyor.

---

## 12. Bilinen Sorunlar / TODO

Sonraki fazlara bırakılan, şu an eksik olan maddeler:

### Kritik (Faz 2 başında yapılmalı)
- [x] **`prisma/seed.ts`** — Tamamlandı. `npm run db:seed` ile çalışır.
- [x] **`.gitignore` kontrolü** — Tamamlandı. `prisma/dev.db`, `src/generated/prisma`, `.env` var.
- [x] **`public/uploads/` klasörü** — Oluşturuldu.
- [x] **Route grupları** — `[locale]/(public)/` ve `[locale]/(auth)/` kuruldu.

### Önemli (Faz 5+)
- [ ] **Logo placeholder** — Header ve Footer'da metin tabanlı logo var. `/public/brand/logo.svg` eklenmeli.
- [ ] **Hero arka plan fotoğrafı** — CSS gradient geçici; gerçek property fotoğrafı eklenecek.
- [x] **`src/lib/rate-limit.ts`** — Login 5/15dk + kayıt 3/10dk + upload 30/saat. Tamamlandı.
- [x] **`src/lib/audit.ts`** — Tüm admin CRUD aksiyonları loglanıyor (listing, user, comment, gallery, settings, 2FA).
- [ ] **Auth `signIn` sayfası locale hardcoded** — `auth.ts`'te `pages.signIn: "/tr/giris"`. İngilizce locale için Faz 6'da düzeltilecek.
- [x] **Galeri lightbox** — `listing-gallery.tsx`'te tam ekran modal, Escape/klavye/thumbnail strip. Tamamlandı.
- [x] **Admin panel mobil** — `AdminShell` + hamburger overlay sidebar. Tamamlandı.
- [x] **404 sayfası** — `app/not-found.tsx` (root) + `[locale]/not-found.tsx` navy/gold tasarımıyla.
- [x] **2FA zorunlu** — Kurulmamış admin → 2fa-kurulum sayfasına yönlendiriliyor.
- [x] **Ban anında etkili** — `session` callback DB'den banned+role yeniden okuyor.
- [x] **Admin ilan listesi sayfalama** — 50/sayfa, `?sayfa=N` parametresi.
- [x] **Upload rate limiting** — 30 yükleme/saat per kullanıcı.

### Sonraya Bırakılanlar (Faz 6)
- [ ] **`ecosystem.config.js` yok** — PM2 config Faz 6 deployment'ta yazılacak.
- [ ] **`README.md` yok** — Kurulum talimatları yazılmamış.
- [ ] **Google OAuth test edilmedi** — `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` boş.
- [ ] **Sosyal medya ikonları** — Footer'daki geçici ikonlar gerçek SVG/iconify ile değiştirilecek.
- [ ] **`/api/contact` route yok** — İletişim formu için Faz 6'da yazılacak.
- [ ] **`/hakkimizda`, `/galeri`, `/iletisim` sayfaları yok** — Header navigasyonundan 404 veriyor.
- [x] **CLAUDE.md Bölüm 3** — `@node-rs/argon2` olarak güncellendi.

---

## 13. AI Agnostik Notlar

> Bu bölüm herhangi bir AI asistanın (Claude, GPT, Gemini, vb.) projeye sorunsuz dahil olabilmesi için yazılmıştır.

### Projeye Başlamadan Önce Mutlaka Oku

Bu proje belirli bir AI'a bağlı değildir. Yeni bir oturumda her AI şu sırayla okumalıdır:

1. `CLAUDE.md` (bu dosya) — tüm mimari kararlar, yol haritası, karar geçmişi
2. `DESIGN_SYSTEM.md` — renk paleti, tipografi, spacing, component stili
3. `VISUAL_REFERENCES.md` — referans tasarım görselleri ve açıklamaları
4. `PHASE_1_SUMMARY.md` — Faz 1'de yapılanlar, kurulum notları
5. `PHASE_2_SUMMARY.md` — Faz 2'de yapılanlar, ilan sistemi, upload pipeline
6. `PHASE_3_SUMMARY.md` — Faz 3'te yapılanlar, filtre sistemi, harita, carousel
7. `[en son PHASE_N_SUMMARY.md]` — her faz sonunda oluşturulan özet

### Kod Yazmadan Önce Zorunlu Adımlar

1. Tüm yukarıdaki dosyaları oku
2. `src/` dizinini tara: hangi component'ler var, hangileri eksik
3. `prisma/schema.prisma`'yı oku: mevcut modeller ve ilişkiler
4. `package.json`'u oku: kurulu paketler (tekrar kurmaya çalışma)
5. Değiştireceğin dosyayı önce oku, sonra düzenle

### Asla Yapma

- `tailwind.config.ts` oluşturma — Tailwind v4: tema `globals.css` içinde `@theme {}` bloğunda
- `middleware.ts` oluşturma — bu projede `src/middleware.ts` kullanılıyor (next-intl)
- Raw SQL / `prisma.$queryRaw` kullanma — sadece Prisma ORM
- Migration'ları elle düzenleme — `prisma migrate dev --name xxx` kullan
- `.env` dosyasına dokunma — sadece `.env.example` güncellenebilir
- `node_modules/`, `.next/`, `public/uploads/` klasörlerine dokunma
- Gereksiz yere `"use client"` ekleme — Server Component varsayılan
- Admin route'larını `auth()` kontrolü olmadan bırakma
