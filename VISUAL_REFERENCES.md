# Görsel Referanslar Rehberi

> Bu dosyada hangi referans görselin sitenin hangi kısmı için kullanılacağı yazılı.
> Claude Code'a bu görselleri verirken bu dokümandaki eşleşmeleri belirt.

---

## Görsellerin Kullanım Haritası

### `01-logo.jpg` — Logo
- **Kullanım yeri:** Header (her sayfada), Footer, Auth sayfalar (giriş/kayıt), favicon, PWA icon, Open Graph image temel.
- **Notlar:**
  - Header'da tam genişlik logo. Mobile'da ikon kısmı (ev + binalar) tek başına da kullanılabilir (hamburger menü açıldığında vb.).
  - Logo'nun SVG versiyonu yapılmalı (raster jpg değil) — Claude Code'a `lucide-react`'ten esinlenerek bir SVG çıkartmasını söyle, ya da Figma'dan export edip `/public/brand/logo.svg` olarak koy.
  - Loading state için sadece simgeli versiyon (ev + binalar) animasyonlu kullan.

### `02-mobile-home.png` — Luxe Estates Mobile (Ana Sayfa)
- **Referans aldığı yer:** Mobile ana sayfa
- **Kullanılacak elementler:**
  - Üstte logo + hamburger + profil yerleşimi
  - "FIND YOUR HOME" tarzı glass search card (bizde "Hayalindeki Mülkü Bul")
  - Featured Listings yatay scroll cards
  - Alt tab navigation (Home / Search / Saved / Profile)
- **Renk eşleşmesi:** Bu zaten bizim paletimiz — birebir uygulanabilir.

### `03-signup-split.png` — Luna Estates Signup
- **Referans aldığı yer:** Kayıt ol / Giriş yap sayfaları
- **Kullanılacak elementler:**
  - Split-screen: solda büyük property fotoğrafı + sağda glass form card
  - Form layout: Full Name → Email → Password → CTA → social login icons
  - "Join {Brand}" Playfair başlık + "Create your account" sub
  - Logo üst soldaki yerleşim
- **Bizde değişiklikler:**
  - Brand: "Luna Estates" → "Güleryüz Gayrimenkul"
  - "Join" → "Hesap Oluştur" / "Üye Ol"
  - Sol fotoğraf yerel/Eskişehir property fotoğrafı olmalı

### `04-gallery-memories.png` — Premier Realty Memories Gallery
- **Referans aldığı yer:** Galeri / Anılar sayfası
- **Kullanılacak elementler:**
  - "Our Memories" başlık ("Anılarımız")
  - Masonry grid (farklı yüksekliklerde kart)
  - Video kartlarında ortada büyük gold play button overlay
  - Hover'da hafif zoom + gold border accent
- **Filtreler:** Tüm / Fotoğraflar / Videolar / Etkinlikler / Ofisten / Başarılar (admin kategorilere göre)

### `05-mobile-detail.png` — Aurora Realty Mobile (Property Detail)
- **Referans aldığı yer:** Mobile ilan detay sayfası
- **Kullanılacak elementler:**
  - Üstte geri butonu + ortada logo
  - Büyük image carousel (yan oklar + dots indicator)
  - Devasa fiyat — Playfair, ortalanmış, parasız sembol
  - 3'lü ikon row (Yatak / Banyo / m²)
  - Property title + adres
  - Sticky bottom CTA "Contact Agent" → bizde "Acente ile İletişim"
- **Eklemeler:**
  - "Favoriye Ekle" kalp ikonu üst sağda
  - "Paylaş" ikonu yanına

### `06-web-home-hero.png` — Luxe Estates Web Hero (Desktop Ana Sayfa)
- **Referans aldığı yer:** Desktop ana sayfa hero
- **Kullanılacak elementler:**
  - Full-bleed background image (sunset villa)
  - "** DISCOVER YOUR **" overline gold
  - "LUXURY SANCTUARY" devasa Playfair (bizde "HAYALİNDEKİ MÜLK" veya benzeri)
  - Alt başlık tek satır
  - Glass search bar yatay 5 kolon: Konum | Tür | Oda | Fiyat | Ara button
  - Hero altında "Öne Çıkan İlanlar" carousel — 4 kart yan yana
- **Carousel:** Sol/sağ ok butonları, dots indicator altta.

### `07-admin-dashboard.png` — Luxe Estates Admin Dashboard
- **Referans aldığı yer:** Admin paneli dashboard
- **Kullanılacak elementler:**
  - Sol sidebar nav (Dashboard / İlanlar / Kullanıcılar / Yorumlar / Galeri / Ayarlar)
  - Üst search bar + bildirim + profil
  - 3 kart grid: Line chart / Bar chart / Donut chart
  - Altında "Yeni İlan Oluştur" form alanı
- **Önemli:**
  - Tüm grafikler navy + gold paletinde (Recharts override)
  - Sidebar collapse edilebilir (mobile'da drawer)

### `08-about-team.png` — Prestige Realty About + Team
- **Referans aldığı yer:** Hakkımızda sayfası
- **Kullanılacak elementler:**
  - Sol: büyük takım fotoğrafı + üstüne "OUR VISION" / "VİZYONUMUZ" Playfair
  - Sağ: "Uzman Ekibimiz" grid, 4×2 takım kartları
  - Her takım kartı: foto + isim + 3 ikon (mail / telefon / linkedin)
  - Footer kompakt
- **Bizde:**
  - "Hakkımızda" → şirket geçmişi paragrafları
  - "Ekibimiz" → admin/agent kullanıcıların profilleri (DB'den çekilecek)
  - Eskişehir lokasyon fotoğrafı eklenebilir

### `09-contact-us.png` — Luxury Estates Contact
- **Referans aldığı yer:** İletişim sayfası
- **Kullanılacak elementler:**
  - Üstte centered "CONTACT US" / "İLETİŞİM" Playfair büyük başlık
  - 2 kolon: "GET IN TOUCH" (info) + "SEND US A MESSAGE" (form)
  - Info kısmı: adres / telefon / email / çalışma saatleri (ikonlu liste)
  - Form: Ad / Email / Telefon / Mesaj + SUBMIT gold button
  - Altta tam genişlik harita (Eskişehir ofis lokasyonu marker'lı)
- **Bizde:**
  - "Mesajınızı Gönderin" → ContactMessage tablosuna kayıt
  - Harita: Leaflet + OSM, ofis koordinatı sabit

### `10-properties-list.png` — Luxe Estates Properties List (Desktop)
- **Referans aldığı yer:** Desktop ilan listeleme sayfası
- **Kullanılacak elementler:**
  - Sol sidebar filter panel:
    - Fiyat aralığı (min-max input)
    - Yatak odası dropdown
    - Bölge/İlçe multi-select
    - Mülk tipi multi-select
    - Ara butonu altta (gold)
  - Sağ tarafta 4 kolon grid kart listesi
  - Her kartta: foto + fiyat overlay üstte + başlık + meta
  - Sayfalama altta veya infinite scroll
- **Eklemeler:**
  - Üstte sıralama dropdown (Yeniye / Eskiye / Fiyat ↑↓)
  - Görünüm toggle (grid / liste / harita)
  - Sonuç sayısı: "1,247 ilan bulundu"

### `11-property-detail.png` — Property Detail (Desktop, Full)
- **Referans aldığı yer:** Desktop ilan detay sayfası
- **Kullanılacak elementler:**
  - Sol üst: büyük hero image + "View 3D Tour" gold pill overlay
  - Sağ üst: fiyat kutusu + acente kart + iletişim formu (Name/Email/Phone/Message + Request Info)
  - Image carousel thumbnails altta
  - "Property Features" 4×2 grid (her özellik ikon + başlık + açıklama)
  - "Floor Plans" görselleri + Download PDF
  - "Location & Map" — embed Google Maps / Leaflet
  - "User Comments" / "Community Insights" — yorum kartları grid
  - Verified Users rozeti
- **Bizde:**
  - "View 3D Tour" → ilanda `virtualTourUrl` varsa görünür
  - "Request Info" → e-posta + bildirim olarak agent'a
  - Yorumlar admin moderasyondan geçer
  - "Komşu/Bölge bilgileri" eklenebilir (okul, market, hastane mesafeleri)

---

## Görsel Hiyerarşisi — Tasarım Stratejisi

### Ortak Stil Çıkarımları (10 referansın tamamından)

1. **Background**: Hep koyu lacivert, hiç beyaz değil
2. **Accent**: Tek aksan = altın gold, başka renk yok
3. **Başlıklar**: Serif (Playfair benzeri), büyük, italic vurgular
4. **Image treatment**: Property fotoğrafları yüksek kontrast, gece/sunset/twilight tercih
5. **Glass surfaces**: Search bar, modal, filter panel hep frosted glass
6. **Spacing**: Cömert padding, asla sıkışık değil
7. **CTA**: Hep pill-shaped gold buton, navy text
8. **Heart icons**: Favori için, gold dolgu veya outline
9. **Property meta**: İkon + sayı + birim formatı, divider ile ayrılmış
10. **Logo treatment**: Hep sol üstte, beyaz/gold tonda

---

## Claude Code'a Görselleri Verme Önerisi

```
guleryuz/
└── docs/
    └── references/
        ├── 01-logo.jpg              (46742.jpg)
        ├── 02-mobile-home.png       (46732.png)
        ├── 03-signup-split.png      (46733.png)
        ├── 04-gallery-memories.png  (46734.png)
        ├── 05-mobile-detail.png     (46735.png)
        ├── 06-web-home-hero.png     (46736.png)
        ├── 07-admin-dashboard.png   (46737.png)
        ├── 08-about-team.png        (46738.png)
        ├── 09-contact-us.png        (46739.png)
        ├── 10-properties-list.png   (46740.png)
        └── 11-property-detail.png   (46741.png)
```

Claude Code başlatırken:
> "docs/references/ klasöründeki görseller tasarım referansım.
> VISUAL_REFERENCES.md dosyasını oku, hangi görsel hangi sayfa için kullanılıyor orada yazıyor.
> DESIGN_SYSTEM.md tasarım kararlarımı içeriyor.
> CLAUDE.md tüm proje brief'i. Önce bu 3 dosyayı oku, sonra Faz 1'e başlayalım."

Claude Code çoklu görsel kabul ediyor; her sayfayı yaparken ilgili referansı sürükle-bırak ile gösterebilirsin:
> "Şimdi ana sayfa hero'sunu yapalım, referans: docs/references/06-web-home-hero.png"
