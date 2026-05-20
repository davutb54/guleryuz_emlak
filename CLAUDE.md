# Güleryüz Gayrimenkul — Proje Brief (CLAUDE.md)

> **Son Güncelleme: 2026-05-20 — Faz 2 tamamen tamamlandı ✅ — Faz 3 sırada**

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

**Faz 2 tamamlandı (2026-05-20).** Faz 3: Gelişmiş Arama sırada.

Faz 3 sırası:
1. Leaflet harita — İlan detay sayfasında konum gösterimi
2. İlanlar listesinde harita görünümü (opsiyonel)
3. Dinamik filtre paneli geliştirme (mobil drawer)
4. URL search params tam senkronu
5. Arama önerileri (basit)

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

---

## 12. Bilinen Sorunlar / TODO

Sonraki fazlara bırakılan, şu an eksik olan maddeler:

### Kritik (Faz 2 başında yapılmalı)
- [x] **`prisma/seed.ts`** — Tamamlandı. `npm run db:seed` ile çalışır.
- [x] **`.gitignore` kontrolü** — Tamamlandı. `prisma/dev.db`, `src/generated/prisma`, `.env` var.
- [x] **`public/uploads/` klasörü** — Oluşturuldu.
- [x] **Route grupları** — `[locale]/(public)/` ve `[locale]/(auth)/` kuruldu.

### Önemli (Faz 3+)
- [ ] **Logo placeholder** — Header ve Footer'da metin tabanlı logo var. `/public/brand/logo.svg` eklenmeli.
- [ ] **Hero arka plan fotoğrafı** — CSS gradient geçici; gerçek property fotoğrafı eklenecek.
- [ ] **`src/lib/rate-limit.ts` yok** — Login rate limiting (5/15 dk) Faz 3'te eklenmeli.
- [ ] **`src/lib/audit.ts` yok** — Admin eylem audit log helper Faz 5'te eklenmeli.
- [x] **`src/lib/validations/listing.ts`** — Tamamlandı.
- [ ] **Upload UI ilan formunda yok** — `/api/upload` çalışıyor ama `listing-form.tsx`'e bağlı değil. Admin ilan formuna resim yükleme UI'ı Faz 3'te eklenecek.
- [ ] **Çoklu görsel carousel** — Detay sayfasında yalnızca `primaryImage` gösteriliyor. Birden fazla görsel carousel'i Faz 3'te eklenecek.
- [ ] **Auth `signIn` sayfası locale hardcoded** — `auth.ts`'te `pages.signIn: "/tr/giris"`. İngilizce locale için Faz 6'da düzeltilecek.
- [ ] **Mobil filtre paneli yok** — İlanlar sayfasında filtre sidebar'ı `hidden lg:block`. Mobil drawer Faz 3'te eklenecek.

### Sonraya Bırakılanlar (Faz 5–6)
- [ ] **`ecosystem.config.js` yok** — PM2 config Faz 6 deployment'ta yazılacak.
- [ ] **`README.md` yok** — Kurulum talimatları yazılmamış.
- [ ] **Google OAuth test edilmedi** — `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` boş.
- [ ] **Auth.js v5 DB Session entegrasyonu** — Şu an JWT. Gerekirse `@auth/prisma-adapter` Prisma 7 uyumu araştırılacak.
- [ ] **Sosyal medya ikonları** — Footer'daki geçici ikonlar gerçek SVG/iconify ile değiştirilecek.
- [x] **CLAUDE.md Bölüm 3** — `@node-rs/argon2` olarak güncellendi.
