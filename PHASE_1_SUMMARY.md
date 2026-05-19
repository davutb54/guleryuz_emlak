# Faz 1 Durum Raporu — Güleryüz Gayrimenkul

**Tarih:** 2026-05-19  
**Durum:** Faz 1 tamamlandı ✅ — Faz 2 başlamaya hazır

---

## Kurulu Paketler

### Framework & Runtime
| Paket | Sürüm | Not |
|-------|-------|-----|
| `next` | 16.2.6 | App Router, Turbopack default |
| `react` / `react-dom` | 19.2.4 | Server Components varsayılan |
| `typescript` | ^5 | Strict mode |

### Veritabanı
| Paket | Sürüm | Not |
|-------|-------|-----|
| `prisma` | ^7.8.0 | Yeni mimari (prisma.config.ts) |
| `@prisma/client` | ^7.8.0 | Generator: `src/generated/prisma` |
| `@prisma/adapter-better-sqlite3` | ^7.8.0 | SQLite için zorunlu driver adapter |
| `better-sqlite3` | ^12.10.0 | Altta yatan SQLite sürücüsü |

### Auth & Güvenlik
| Paket | Sürüm | Not |
|-------|-------|-----|
| `next-auth` | ^5.0.0-beta.31 | Auth.js v5 |
| `@node-rs/argon2` | ^2.0.2 | Argon2id — Windows uyumlu (Rust NAPI) |
| `zod` | ^4.4.3 | Input validation |

### UI & Stil
| Paket | Sürüm | Not |
|-------|-------|-----|
| `tailwindcss` | ^4 | CSS-first, @theme inline |
| `@tailwindcss/postcss` | ^4 | PostCSS entegrasyonu |
| `clsx` | ^2.1.1 | Class birleştirici |
| `tailwind-merge` | ^3.6.0 | Conflict çözücü |
| `class-variance-authority` | ^0.7.1 | shadcn variant sistemi |
| `@radix-ui/react-slot` | ^1.2.4 | shadcn Slot component'i |
| `lucide-react` | ^1.16.0 | İkon seti |

### i18n
| Paket | Sürüm | Not |
|-------|-------|-----|
| `next-intl` | ^4.12.0 | App Router entegrasyonu |

### Dev Bağımlılıkları
`dotenv` (prisma.config.ts için), `@types/better-sqlite3`, ESLint + next eslint config

---

## Rotalar / Sayfalar

```
src/app/
├── layout.tsx                  ✅ Root layout (font CSS var tanımları)
├── page.tsx                    ✅ Root redirect (next-intl otomatik hallediyor)
└── [locale]/
    ├── layout.tsx              ✅ Locale layout — Header + main + Footer
    └── page.tsx                ✅ Ana sayfa → HomeHero component
```

**Henüz oluşturulmayan rotalar** (Faz 2+):
- `/[locale]/ilanlar` — ilan listesi
- `/[locale]/ilan/[slug]` — ilan detay
- `/[locale]/hakkimizda`, `/galeri`, `/iletisim`
- `/[locale]/giris`, `/kayit`
- `/[locale]/admin/**`

**Desteklenen locale'ler:** `tr` (default), `en`  
**Route grupları `(public)` / `(auth)`** henüz kurulmadı; `page.tsx` düz `[locale]/` altında.

---

## Component'ler

### Layout
| Dosya | Tür | Açıklama |
|-------|-----|----------|
| `src/components/layout/header.tsx` | Client | Sticky nav, mobil drawer, gold aktif link animasyonu |
| `src/components/layout/footer.tsx` | Server | 4 sütun grid, sosyal ikonlar, yasal linkler |

### Hero
| Dosya | Tür | Açıklama |
|-------|-----|----------|
| `src/components/hero/home-hero.tsx` | Client | Radial gradient BG, arama çubuğu (glass), istatistik bandı |

### UI (shadcn/ui — manuel kurulum)
| Dosya | Açıklama |
|-------|----------|
| `src/components/ui/button.tsx` | cva ile 6 variant (default/destructive/outline/secondary/ghost/link) |
| `src/components/ui/input.tsx` | Temel text input |
| `src/components/ui/card.tsx` | Card + CardHeader + CardTitle + CardDescription + CardContent + CardFooter |

---

## Veritabanı Şeması

**Sürüm:** Prisma 7.8.0  
**Dosya:** `prisma/schema.prisma`  
**Migration:** `prisma/migrations/20260519113028_init/` — uygulandı ✅  
**DB dosyası:** `prisma/dev.db` (oluşturuldu)  
**Client çıktısı:** `src/generated/prisma/` (22 dosya)

### Enum'lar (4)
- `Role`: USER, AGENT, ADMIN, SUPER_ADMIN
- `ListingCategory`: HOUSE, LAND, FIELD, SHOP
- `ListingStatus`: DRAFT, PENDING, ACTIVE, SOLD, RENTED, ARCHIVED
- `ListingType`: SALE, RENT

### Model'ler (13)
| Model | Notlar |
|-------|--------|
| `User` | Auth + rol sistemi; 2FA alanları hazır |
| `Session` | JWT strateji nedeniyle şimdilik kullanılmıyor |
| `Listing` | ~30 alan; TR/EN title+desc, tüm kategori özellikleri |
| `ListingImage` | order + isPrimary |
| `ListingFeature` | Genişletilebilir key-value |
| `PriceHistory` | Fiyat değişim geçmişi |
| `Favorite` | userId+listingId unique |
| `Comment` | rating (1-5) + admin onay |
| `Notification` | TR/EN title, read flag |
| `SearchAlert` | JSON filters, frequency |
| `GalleryItem` | image/video, kategori |
| `ContactMessage` | İletişim formu mesajları |
| `AuditLog` | 3 index (userId, action, createdAt) |
| `SiteSettings` | id=1 singleton |

---

## Auth Durumu

**Strateji:** JWT (HttpOnly cookie)  
**Çalışıyor mu:** ✅ Yapısal olarak hazır; `prisma/seed.ts` olmadığı için test edilmedi

### Provider'lar
| Provider | Durum | Not |
|----------|-------|-----|
| `Credentials` | ✅ Hazır | Zod validation → DB lookup → Argon2id verify |
| `Google OAuth` | ⚠️ Konfigüre edilmedi | `GOOGLE_CLIENT_ID/SECRET` `.env`'de boş |

### Önemli Detaylar
- Giriş sayfası: `/tr/giris` (henüz oluşturulmadı)
- Google OAuth: yalnızca DB'de kaydı olan e-posta kabul ediliyor (`signIn` callback)
- `session.user.id` ve `session.user.role` JWT üzerinden dönüyor
- DB `Session` tablosu şimdilik kullanılmıyor (Auth.js adapter yok)
- `AUTH_SECRET` `.env`'de mevcut

### Şifre Hash
- `@node-rs/argon2` — `memoryCost: 65536`, `timeCost: 3`, `parallelism: 1`, `outputLen: 32`
- `src/lib/password.ts` → `hashPassword()` + `verifyPassword()`

---

## i18n Durumu

| Dosya | Açıklama |
|-------|----------|
| `src/i18n/routing.ts` | `locales: ["tr", "en"]`, `defaultLocale: "tr"` |
| `src/i18n/request.ts` | `getRequestConfig` — locale validation + mesaj import |
| `src/i18n/navigation.ts` | `Link`, `usePathname`, `useRouter` (locale-aware) |
| `src/middleware.ts` | next-intl middleware, `/((?!api|_next|...)*)` matcher |
| `messages/tr.json` | nav, hero, search, listing, footer, auth, common |
| `messages/en.json` | Aynı key'ler İngilizce karşılıklarıyla |

---

## Çözülen Ana Sorunlar

### 1. Prisma 7 Mimari Değişikliği
- **Sorun:** Prisma 7'de `schema.prisma`'da `url = env(...)` yok; datasource boş. Config `prisma.config.ts`'e taşındı.
- **Çözüm:** `prisma.config.ts` oluşturuldu; `@prisma/adapter-better-sqlite3` kurularak `new PrismaClient({ adapter })` ile başlatıldı.
- **İmport yolu:** `@/generated/prisma/client` (not: `@/generated/prisma`)

### 2. Windows'ta Argon2 Build Sorunu
- **Sorun:** `argon2` paketi node-gyp native build gerektiriyor → Windows'ta sorunlu.
- **Çözüm:** `@node-rs/argon2` (Rust/NAPI tabanlı) — aynı API, platform bağımsız.

### 3. Auth.js v5 JWT Tip Sorunu
- **Sorun:** `token.id`, `token.role` TypeScript'te `unknown` döndürüyor.
- **Çözüm:** `session` callback'te explicit cast: `token.id as string`, `token.role as "USER" | ...`

### 4. shadcn/ui — Tailwind v4 Uyumu
- **Sorun:** `npx shadcn@latest init` interaktif; CI/otomatik kurulumda takılıyor.
- **Çözüm:** `components.json` manuel oluşturuldu. Bağımlılıklar (`clsx`, `twMerge`, `cva`, `@radix-ui/react-slot`) elle kuruldu. Componentler `--yes` flag'iyle eklendi.

### 5. Middleware Dosya Adı
- **Sorun:** CLAUDE.md `src/proxy.ts` diyordu; Next.js standart middleware dosyası `src/middleware.ts`.
- **Çözüm:** `src/middleware.ts` olarak oluşturuldu, CLAUDE.md güncellendi.

### 6. lucide-react Sosyal İkon Eksikliği
- **Sorun:** `lucide-react` Instagram, Facebook, YouTube ikonlarını export etmiyor.
- **Geçici Çözüm:** Footer'da `Camera`, `Users`, `Play` kullanıldı. Faz 6'da `@iconify/react` veya inline SVG ile değiştirilecek.

### 7. next.config.ts TypeScript Hatası
- **Sorun:** `experimental.reactCompiler: true` — `ExperimentalConfig` tipinde yok.
- **Çözüm:** `experimental` bloğu kaldırıldı.

---

## Eksik / Faz 2'de İlk Yapılacaklar

| Öncelik | Madde |
|---------|-------|
| 🔴 Kritik | `prisma/seed.ts` — İlk SUPER_ADMIN kullanıcısı |
| 🔴 Kritik | `.gitignore` — `prisma/dev.db`, `src/generated/`, `.env` kontrolü |
| 🔴 Kritik | `public/uploads/` klasörü |
| 🔴 Kritik | Route grupları `[locale]/(public)/` ve `[locale]/(auth)/` |
| 🟡 Önemli | `src/lib/rate-limit.ts` — Login rate limiting |
| 🟡 Önemli | `src/lib/validations/listing.ts` — Listing Zod şeması |
| 🟡 Önemli | Admin ilan CRUD sayfaları |
| 🟡 Önemli | Sharp upload API |
