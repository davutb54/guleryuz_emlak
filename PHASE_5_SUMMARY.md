# Faz 5 Özeti — Admin Paneli + Güvenlik Sağlamlaştırması

> Oluşturulma: 2026-05-21
> Kapsam: Admin paneli tüm sayfaları, 2FA, dashboard, güvenlik düzeltmeleri

---

## 1. Admin Sayfaları ve URL'leri

| URL | Dosya | Rol Kısıtı | Açıklama |
|-----|-------|------------|---------|
| `/admin` | `admin/page.tsx` | AGENT+ | Dashboard — istatistik kartları + grafikler |
| `/admin/ilanlar` | `admin/ilanlar/page.tsx` | AGENT+ | İlan listesi — filtre + toplu işlem + sayfalama |
| `/admin/ilanlar/yeni` | `admin/ilanlar/yeni/page.tsx` | AGENT+ | Yeni ilan formu |
| `/admin/ilanlar/[id]` | `admin/ilanlar/[id]/page.tsx` | AGENT+ | İlan düzenleme |
| `/admin/kullanicilar` | `admin/kullanicilar/page.tsx` | ADMIN/SA | Kullanıcı listesi — rol + ban |
| `/admin/yorumlar` | `admin/yorumlar/page.tsx` | ADMIN/SA | Yorum moderasyonu — yayınla/gizle/sil |
| `/admin/galeri` | `admin/galeri/page.tsx` | ADMIN/SA | Galeri yönetimi — ekle/sıralandır/sil |
| `/admin/iletisim` | `admin/iletisim/page.tsx` | ADMIN/SA | Gelen mesajlar — oku/sil |
| `/admin/audit-log` | `admin/audit-log/page.tsx` | ADMIN/SA | Denetim günlüğü — salt okunur, filtrelenebilir |
| `/admin/ayarlar` | `admin/ayarlar/page.tsx` | ADMIN/SA | Site ayarları — iletişim, sosyal, hakkımızda |
| `/admin/2fa-kurulum` | `admin/2fa-kurulum/page.tsx` | ADMIN/SA | TOTP kurulum — QR + doğrulama + devre dışı |
| `/admin/2fa-dogrula` | `admin/2fa-dogrula/page.tsx` | AGENT+ | TOTP login doğrulaması |

**RBAC Katmanları:**
- Layout (`admin/layout.tsx`): AGENT/ADMIN/SA kontrolü + 2FA zorunluluğu
- Sayfa: hassas sayfalar kendi `auth()` + ADMIN/SA kontrolü
- Server Action: her action bağımsız role check

---

## 2. 2FA Akışı — Adım Adım

### İlk Kurulum (ADMIN/SA, 2FA henüz kurulmamış)

```
1. Admin giriş yapar (email + şifre)
2. Auth.js JWT cookie set edilir (role: ADMIN)
3. Herhangi bir admin sayfasına gider
4. Admin layout: twoFactorEnabled=false → /admin/2fa-kurulum'a redirect
5. 2fa-kurulum sayfası: "2FA Kur" butonuna basar
6. initiate2FASetup() Server Action:
   - OTPAuth.Secret oluştur (32 byte random)
   - base32 encode et
   - otpauthURL ile QR data URL üret (qrcode kütüphanesi)
   - guleryuz-2fa-setup cookie'ye {userId}|{secretBase32}|{hmac} yaz (10 dk TTL)
   - QR data URL client'a döndür
7. Admin QR'ı Authenticator uygulamasıyla tarar
8. 6 haneli kodu girer → confirm2FASetup(code) Server Action:
   - guleryuz-2fa-setup cookie'yi oku + HMAC doğrula
   - TOTP kodu verify et (otpauth, window:1)
   - DB'de User.twoFactorEnabled=true, User.twoFactorSecret=base32 kaydet
   - guleryuz-2fa-setup cookie sil
   - guleryuz-2fa-verified cookie yaz ({userId}|{exp}|{hmac}, 8 saat TTL)
   - /admin'e redirect
```

### Normal Login (2FA kurulu admin)

```
1. Admin giriş yapar
2. Admin layout: twoFactorEnabled=true + is2FAVerified()=false → /admin/2fa-dogrula
3. 2fa-dogrula sayfası: 6 haneli kodu girer → verify2FALogin(code) Server Action:
   - DB'den twoFactorSecret oku
   - TOTP kodu verify et
   - guleryuz-2fa-verified cookie yaz (8 saat)
   - /admin'e redirect (client-side router.replace)
```

### Cookie Yapısı

| Cookie | Format | TTL | Amaç |
|--------|--------|-----|------|
| `guleryuz-2fa-setup` | `{userId}\|{secretBase32}\|{hmac}` | 10 dk | Geçici setup secret |
| `guleryuz-2fa-verified` | `{userId}\|{exp}\|{hmac}` | 8 saat | Doğrulanmış session |

HMAC: SHA-256 ile `AUTH_SECRET` (Node.js `crypto.createHmac`).

---

## 3. Güvenlik Gereksinimleri Karşılanma Durumu

| Gereksinim (CLAUDE.md §6) | Durum | Notlar |
|---------------------------|-------|--------|
| Şifre: Argon2id, min 8 karakter | ✅ | `@node-rs/argon2`, 64MB/timeCost=3 |
| Admin 2FA zorunlu | ✅ | TOTP + cookie-based, kurulmamış admin → setup redirect |
| Rate limiting: login 5/15dk | ✅ | `rate-limit.ts`, per email |
| Rate limiting: API 100 req/dk per IP | ⏳ | Nginx seviyesinde yapılacak (Faz 6 deployment) |
| Rate limiting: upload 30/saat | ✅ | `/api/upload` endpoint'e eklendi |
| Audit log: her admin eylemi | ✅ | listing CRUD, user, comment, gallery, settings, 2FA |
| RBAC: `/admin/*` sadece ADMIN/SA | ✅ | Layout + sayfa + action 3 katmanlı |
| CSRF koruması | ✅ | Server Actions (Next.js built-in) |
| Upload: MIME check + sharp encode | ✅ | `file.type` + `sharp().metadata()` çift katman |
| Input validation: Zod | ✅ | Tüm Server Actions + API routes |
| SQL injection: sadece Prisma | ✅ | Raw query yok |
| XSS: dangerouslySetInnerHTML yok | ✅ | React escape + hiç raw HTML yok |
| Session: HttpOnly JWT cookie | ✅ | Auth.js v5 JWT strateji |
| Ban anında etkili | ✅ | `session` callback DB'den yeniden okuyor |

---

## 4. Recharts Kurulumu ve Renk Konfigürasyonu

**Bileşen:** `src/components/admin/dashboard-charts.tsx` — `"use client"` Client Component.

**Grafikler:**
- `AreaChart`: Son 7 gün ilan + üye aktivitesi (çift çizgi)
- `PieChart`: Kategori dağılımı (HOUSE/LAND/FIELD/SHOP)
- `BarChart`: Durum dağılımı (ACTIVE/DRAFT/SOLD/...)

**Renk paleti:**
```typescript
const COLORS = ["#D4A744", "#60A5FA", "#4ADE80", "#C084FC", "#F87171", "#34D399"];
// Gold, Mavi, Yeşil, Mor, Kırmızı, Teal — tasarım sistemine uygun

// Tooltip: navy-800 arka plan, cream-100 metin
// Grid: navy-700 stroke
// Axis: silver-500 metin
```

**Veri akışı:** Server Component (dashboard/page.tsx) DB'den çeker → `DashboardCharts`'a prop olarak geçer → Recharts render eder.

---

## 5. Audit Log Yazma Noktaları

Şu anda loglanmakta olan tüm aksiyonlar:

| Action String | Tetikleyen Fonksiyon | Entity |
|--------------|---------------------|--------|
| `listing.create` | `createListing()` | Listing |
| `listing.update` | `updateListing()` | Listing |
| `listing.delete` | `deleteListing()` | Listing |
| `listing.status_change` | `changeListingStatus()` | Listing |
| `listing.toggle_featured` | `toggleFeatured()` | Listing |
| `listing.bulk_activate` | `bulkListingAction()` | Listing |
| `listing.bulk_archive` | `bulkListingAction()` | Listing |
| `listing.bulk_delete` | `bulkListingAction()` | Listing |
| `user.role_change` | `changeUserRole()` | User |
| `user.ban` | `toggleBanUser()` | User |
| `user.unban` | `toggleBanUser()` | User |
| `comment.hide` | `toggleApproveComment()` | Comment |
| `comment.approve` | `toggleApproveComment()` | Comment |
| `comment.delete` | `deleteComment()` | Comment |
| `gallery.create` | `createGalleryItem()` | GalleryItem |
| `gallery.delete` | `deleteGalleryItem()` | GalleryItem |
| `settings.update` | `updateSiteSettings()` | SiteSettings |
| `2fa.enabled` | `confirm2FASetup()` | User |
| `2fa.disabled` | `disable2FA()` | User |

**Loglanmayan (bilerek):** `createComment` (kullanıcı aksiyonu), `toggleFavorite`, `markMessageRead`.

---

## 6. Faz 6'ya Devreden TODO'lar

### Kritik (sitenin açılması için zorunlu)
- [ ] `/hakkimizda` sayfası — Header navigasyonundan 404 veriyor
- [ ] `/iletisim` sayfası + `/api/contact` POST route — Header navigasyonundan 404 + iletişim formu yok
- [ ] `/galeri` sayfası — Header navigasyonundan 404 veriyor
- [ ] `ecosystem.config.js` — PM2 deployment config

### SEO (açılış öncesi)
- [ ] `sitemap.xml` — tüm aktif ilanlar + statik sayfalar
- [ ] `robots.txt`
- [ ] Schema.org `RealEstateListing` JSON-LD (ilan detay sayfası)
- [ ] OpenGraph tag'leri hakkimizda/galeri/iletisim sayfaları için

### Yasal
- [ ] KVKK aydınlatma metni sayfası
- [ ] Gizlilik politikası sayfası
- [ ] Cookie consent banner

### Tasarım
- [ ] `/public/brand/logo.svg` — gerçek logo (şu an metin tabanlı)
- [ ] Hero arka plan fotoğrafı — `/public/images/hero-bg.jpg`
- [ ] Footer sosyal medya ikonları — gerçek SVG (Instagram, Facebook, YouTube, X)

### Teknik
- [ ] Nginx rate limiting: `limit_req_zone` 100 req/dk per IP (deployment'ta)
- [ ] SSL: Certbot Let's Encrypt
- [ ] PM2 `ecosystem.config.js` + `pm2 startup`
- [ ] Backup: cron + rsync SQLite → Cloudflare R2 / Backblaze B2
- [ ] `README.md` kurulum talimatları
- [ ] Google OAuth test: `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` doldurulacak

### Performans
- [ ] Lighthouse 90+ audit
- [ ] `next/image` `priority` prop — LCP görselleri için
- [ ] Font preload — Playfair Display critical weight

---

## 7. Faz 5 Teknik Kararlar Özeti

**2FA Backup Kodu Yok:** Sadece TOTP uygulaması (Google Authenticator, Authy) destekleniyor. Telefon kaybolursa admin başka SUPER_ADMIN aracılığıyla 2FA devre dışı bırakabilir, ya da doğrudan DB'de `twoFactorEnabled=false, twoFactorSecret=null` yapılabilir.

**JWT vs DB Session:** Auth.js v5 JWT stratejisi devam ediyor. Ban/rol değişimi `session` callback DB sorgusıyla anında etkili. Oturum süresi Auth.js default (30 gün JWT expiry) + 8 saatlik 2FA verified cookie.

**Dashboard Cache Yok:** 11 sorgu her istekte çalışıyor. SiteSettings cache yapılabilir ama dashboard küçük site için yeterli.

**Galeri Video:** Dosya yükleme yok. YouTube/Vimeo URL'si manuel girilir, `<iframe>` veya `<video>` ile oynatılır (Faz 6 galeri sayfasında).
