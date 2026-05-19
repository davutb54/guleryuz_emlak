# Güleryüz Gayrimenkul — Proje Brief (CLAUDE.md)

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
| Şifre hash | Argon2id (`argon2` paketi) | bcrypt'ten güvenli |
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
│   └── proxy.ts                 # auth + locale + rate limit (Next.js 16: middleware.ts → proxy.ts)
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
- [ ] `package.json` scripts'e `--turbopack` ekle (dev + build)
- [ ] `src/app/globals.css`'e `@theme` ile tasarım sistemi renkleri + fontları
- [ ] Playfair Display + Inter `next/font/google` ile yükle
- [ ] shadcn/ui init (CLI Tailwind v4'ü destekliyor)
- [ ] Prisma + SQLite kurulum, ilk migration
- [ ] next-intl kurulum, tr/en mesaj dosyaları
- [ ] Auth.js v5 (email/şifre + Google)
- [ ] Argon2 password hashing
- [ ] Layout, Header (logo+menü), Footer
- [ ] Ana sayfa hero + featured listings placeholder
- [ ] `.env.example`, README

### Faz 2: İlan Sistemi Çekirdeği
- [ ] Listing CRUD (admin)
- [ ] Çoklu dil destekli form (TR/EN tab)
- [ ] Sharp ile fotoğraf upload + resize + WebP
- [ ] İlan listeleme sayfası (filtre + sayfalama)
- [ ] İlan detay sayfası (galeri carousel, harita, özellikler)
- [ ] Slug otomatik üretimi (`modern-villa-tepebasi-3-1`)
- [ ] Görüntülenme sayacı

### Faz 3: Gelişmiş Arama
- [ ] Dinamik filtre paneli (kategori bazlı alanlar)
- [ ] URL search params senkronu
- [ ] Eskişehir ilçe/mahalle veri seti (JSON statik)
- [ ] Leaflet harita ilanlar üzerinde
- [ ] Arama önerileri (kullanıcı geçmişine göre — basit cosine similarity)

### Faz 4: Kullanıcı Etkileşimi
- [ ] Favori sistemi
- [ ] Yorum sistemi (admin moderasyonlu)
- [ ] Bildirim merkezi (in-app + email)
- [ ] Profil sayfası
- [ ] Arama alarmları (SearchAlert) + cron job (node-cron)
- [ ] Paylaş butonları (Open Graph meta tag'leri kritik)

### Faz 5: Admin Paneli
- [ ] Dashboard (Recharts grafikler)
- [ ] İlan yönetimi (filtre, toplu işlem)
- [ ] Kullanıcı yönetimi (rol, ban)
- [ ] Yorum moderasyonu
- [ ] Galeri yönetimi (foto+video upload)
- [ ] İletişim mesajları görüntüleme
- [ ] Audit log görüntüleyici
- [ ] 2FA kurulum akışı
- [ ] Site ayarları (iletişim, sosyal)

### Faz 6: Sayfalar + Cila + Deployment
- [ ] Hakkımızda sayfası
- [ ] İletişim sayfası + form + harita
- [ ] Galeri/Anılar sayfası (lightbox, video player)
- [ ] SEO: sitemap.xml, robots.txt, Schema.org RealEstateListing JSON-LD
- [ ] OpenGraph + Twitter Cards
- [ ] KVKK aydınlatma + cookie consent
- [ ] Kullanım koşulları + gizlilik
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

Faz 1'in ilk adımı tamam: Next.js 16 + TS + Tailwind kuruldu (kullanıcı tarafından elle).

Sıradaki adımlar:
1. Turbopack'i geri aç (kurulumda `--no-turbopack` ile devre dışı bırakıldı). `package.json`'da `"dev": "next dev --turbopack"` ve `"build": "next build --turbopack"`.
2. Tailwind config'i DESIGN_SYSTEM.md'deki renk paleti + tipografi ile güncelle.
3. Playfair Display + Inter fontlarını `next/font/google` ile yükle.
4. shadcn/ui init + base componentler (button, input, card).
5. Prisma init + SQLite + ilk migration (schema.prisma — CLAUDE.md'deki taslaktan).
6. next-intl kurulum + `messages/tr.json`, `messages/en.json` + `[locale]` route segmenti.
7. Auth.js v5 (NextAuth) kurulum + Argon2id hashing.
8. Header + Footer iskelet + ana sayfa Hero skeleton.

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

- **Middleware dosya adı: `src/proxy.ts`** (eski `middleware.ts` değil). Export edilen fonksiyon adı `proxy`, runtime Node.js (Edge desteklenmiyor).
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
