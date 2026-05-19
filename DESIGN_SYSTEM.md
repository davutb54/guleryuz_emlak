# Güleryüz Gayrimenkul — Tasarım Sistemi

> Bu doküman tüm UI tasarım kararlarını içerir. Claude Code her component üretirken
> bu dokümanı referans almalı. Tasarım dili: **Modern Lüks Editorial Dark** — koyu
> lacivert kanvas + altın aksanlar + serif başlıklar + sans-serif gövde + cam (glass)
> efektleri + cömert beyaz alan.

---

## 1. Tasarım Felsefesi

**3 Temel Prensip:**

1. **"Quiet Luxury"** — Bağırmaz, fısıldar. Az ama doğru aksan. Her gold elementi kazanılmış olmalı.
2. **Editorial hierarchy** — Magazin gibi. Büyük serif başlıklar + küçük sans gövde + bolca nefes alanı.
3. **Material believability** — Gerçek materyalleri hissettir: cam (frosted glass), pirinç (brushed gold), keten dokulu kağıt (subtle noise).

**Kaçınılacaklar:**
- ❌ Saturasyonu yüksek renkler
- ❌ Köşeli/sert geometriler (yumuşak köşeler tercih)
- ❌ Çoklu vurgu renkleri (sadece gold accent)
- ❌ Aşırı ikon kullanımı (minimal, line style)
- ❌ Aggressive gradient'lar
- ❌ Çok renkli grafikler (admin grafikleri bile sadece navy/gold paletinde)

---

## 2. Renk Paleti

### Brand Colors (Logo'dan türetildi)

```css
/* Navy spektrum — birincil kanvas */
--navy-950: #050E1F;   /* en koyu — modal arkaplan, deep shadow */
--navy-900: #0A1628;   /* ana arka plan (en çok kullanılan) */
--navy-850: #0E1D33;   /* alternatif yüzeyler, card hover */
--navy-800: #142540;   /* card arka plan, filter panel */
--navy-700: #1B2F4E;   /* divider üstü, ikincil yüzey */
--navy-600: #243C5F;   /* border, subtle outline */
--navy-500: #34527E;   /* disabled text on dark */

/* Gold spektrum — birincil aksan */
--gold-500: #D4A744;   /* ana gold — CTA, vurgu, ikon */
--gold-400: #E0B85C;   /* hover state, parlak vurgu */
--gold-300: #E8C77A;   /* light highlight, gradient stop */
--gold-600: #B8902F;   /* pressed state, darker accent */
--gold-700: #8E6E1F;   /* en koyu gold, footer text */

/* Silver/Pearl — ikincil aksan (logo'dan) */
--silver-300: #D8DCE4; /* light accent, secondary text bright */
--silver-400: #BFC4CE; /* line, divider */
--silver-500: #9098A6; /* muted text */

/* Cream/Ivory — text on dark */
--cream-50:  #FAF7F0;  /* en parlak text, headline */
--cream-100: #F5F1E8;  /* gövde text varsayılan */
--cream-200: #E8E3D5;  /* secondary body */
--cream-300: #C9C2AE;  /* tertiary, caption */
```

### Semantic Tokens

```css
/* Backgrounds */
--bg-canvas:        var(--navy-900);   /* sayfa arka planı */
--bg-surface:       var(--navy-850);   /* card, panel */
--bg-surface-hover: var(--navy-800);
--bg-elevated:      var(--navy-800);   /* modal, dropdown */
--bg-overlay:       rgba(5, 14, 31, 0.85); /* modal backdrop */

/* Glass surfaces — referans tasarımlarda çok kullanılan */
--glass-bg:         rgba(20, 37, 64, 0.55);
--glass-border:     rgba(212, 167, 68, 0.18);
--glass-blur:       16px;

/* Text */
--text-primary:     var(--cream-50);
--text-body:        var(--cream-100);
--text-secondary:   var(--cream-300);
--text-muted:       var(--silver-500);
--text-accent:      var(--gold-500);
--text-inverse:     var(--navy-900);   /* gold buton üstündeki text */

/* Borders */
--border-subtle:    rgba(212, 167, 68, 0.12);
--border-default:   rgba(212, 167, 68, 0.25);
--border-strong:    var(--gold-500);
--border-divider:   rgba(216, 220, 228, 0.08);

/* States */
--success: #4ADE80;
--warning: #FBBF24;
--error:   #F87171;
--info:    #60A5FA;

/* Bu state renkleri SADECE bildirim/uyarı için. Brand'de yoklar. */
```

### Kullanım Kuralı

- `--navy-900` ekranın %70'ini kaplar.
- `--gold-500` ekranın %3-5'ini geçmemeli (CTA, başlık vurgusu, ikonlar, fiyat).
- `--cream-100` text'in %90'ı.
- Her gold element bir amaca hizmet etmeli (aksiyona davet, marka, vurgu).

---

## 3. Tipografi

### Font Stack

```css
/* Başlık — editorial serif */
--font-display: 'Playfair Display', 'Cormorant Garamond', 'Georgia', serif;

/* Gövde — modern geometric sans */
--font-body: 'Inter', 'Manrope', system-ui, -apple-system, sans-serif;

/* Sayısal/teknik */
--font-mono: 'JetBrains Mono', 'SF Mono', monospace;
```

Google Fonts:
- Playfair Display: 400, 500, 600, 700, italic
- Inter: 400, 500, 600, 700

### Tip Skalası (Major Third — 1.25 oranı)

| Token | Px | Rem | Font | Line-height | Letter-spacing | Kullanım |
|-------|----|----|------|-------------|----------------|----------|
| `display-2xl` | 88 | 5.5rem | Playfair 700 | 1.0 | -0.04em | Hero başlık (web) |
| `display-xl` | 64 | 4rem | Playfair 700 | 1.05 | -0.03em | Hero (mobile lg) |
| `display-lg` | 48 | 3rem | Playfair 600 | 1.1 | -0.02em | Section başlık |
| `display-md` | 36 | 2.25rem | Playfair 600 | 1.15 | -0.02em | Page title |
| `display-sm` | 28 | 1.75rem | Playfair 600 | 1.2 | -0.01em | Card title (büyük) |
| `h1` | 32 | 2rem | Inter 700 | 1.2 | -0.02em | Body H1 |
| `h2` | 24 | 1.5rem | Inter 600 | 1.3 | -0.01em | Body H2 |
| `h3` | 20 | 1.25rem | Inter 600 | 1.4 | 0 | Card title |
| `h4` | 18 | 1.125rem | Inter 600 | 1.4 | 0 | Subsection |
| `body-lg` | 18 | 1.125rem | Inter 400 | 1.6 | 0 | Lead paragraf |
| `body` | 16 | 1rem | Inter 400 | 1.6 | 0 | Default |
| `body-sm` | 14 | 0.875rem | Inter 400 | 1.55 | 0 | Secondary text |
| `caption` | 13 | 0.8125rem | Inter 500 | 1.5 | 0.02em | Meta info |
| `label` | 12 | 0.75rem | Inter 600 | 1.4 | 0.08em UC | Form label, badge |
| `overline` | 11 | 0.6875rem | Inter 600 | 1.3 | 0.16em UC | Section etiketi |

**Uppercase (UC):** `letter-spacing` yüksek olduğunda harfler uppercase yazılır. Marka isimleri ve overline'lar için.

### Tipografi Kuralları

1. **Hero/Section başlıkları** her zaman Playfair (serif). Marka kimliği bu.
2. **Body/UI text** her zaman Inter. Okunabilirlik için.
3. **Italik kullanımı:** Sadece Playfair'da, vurgu için: *"Discover Your"* gibi.
4. **Uppercase:** Sadece overline, label, badge ve buton text'inde. Sentence Case (Cümle Düzeni) varsayılan.
5. **Number tabular:** Fiyatlarda `font-variant-numeric: tabular-nums;` — kolon hizalama.
6. **Decorative dash:** Başlık altına ince gold çizgi: `width: 60px; height: 1px; background: var(--gold-500);`

---

## 4. Spacing & Layout

### Spacing Scale (4px tabanlı)

```
0   1    2    3    4    5    6    8    10    12    16    20    24    32    40    48    64
0   4    8    12   16   20   24   32   40    48    64    80    96    128   160   192   256
```

### Container

```css
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1440px;  /* ana max-width */
--container-prose: 720px; /* hakkımızda, blog */

/* Yatay padding */
--page-x-mobile:  20px;
--page-x-tablet:  32px;
--page-x-desktop: 64px;
```

### Section Rhythm

- Section'lar arası dikey boşluk: **96px desktop / 64px tablet / 48px mobile**
- Section içi başlık-içerik arası: **48px / 32px / 24px**
- Card grid gap: **24px desktop / 16px mobile**
- Form field gap: **20px**

### Grid

- Desktop product grid: **4 kolon**, gap 24px
- Tablet: **2-3 kolon**, gap 20px
- Mobile: **1 kolon**, full width

### Breakpoints (Tailwind default + custom)

```js
sm: 640px,
md: 768px,
lg: 1024px,
xl: 1280px,
2xl: 1440px,
3xl: 1680px,
```

---

## 5. Köşeler, Gölgeler, Efektler

### Border Radius

```css
--radius-xs:   4px;   /* küçük badge */
--radius-sm:   8px;   /* input, küçük buton */
--radius-md:   12px;  /* card */
--radius-lg:   16px;  /* büyük card, modal */
--radius-xl:   24px;  /* hero card, search bar */
--radius-2xl:  32px;  /* feature box */
--radius-full: 9999px; /* pill, oval buton, avatar */
```

**Kural:** Pill butonlar (`--radius-full`) gold CTA için. Card'lar `--radius-lg` veya `--radius-xl`.

### Shadows

```css
/* Genel kural: koyu zeminde gölge YOK, parlaklık VAR */
--glow-gold-sm:  0 0 16px rgba(212, 167, 68, 0.15);
--glow-gold-md:  0 0 32px rgba(212, 167, 68, 0.25);
--glow-gold-lg:  0 8px 48px rgba(212, 167, 68, 0.35);

--shadow-card:        0 4px 24px rgba(0, 0, 0, 0.4);
--shadow-card-hover:  0 8px 40px rgba(0, 0, 0, 0.55);
--shadow-modal:       0 20px 60px rgba(0, 0, 0, 0.7);

/* Inner border (lüks his) */
--inner-border-gold:  inset 0 0 0 1px rgba(212, 167, 68, 0.2);
```

### Glass Morphism (Frosted Glass)

Referans tasarımlarda search bar, modal, filter panel'lerde kullanılıyor.

```css
.glass {
  background: rgba(20, 37, 64, 0.55);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid rgba(212, 167, 68, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 4px 24px rgba(0, 0, 0, 0.4);
}
```

### Gradient'lar

```css
/* Hero overlay — fotoğraf üstüne text okutmak için */
--gradient-hero-overlay: linear-gradient(
  180deg,
  rgba(10, 22, 40, 0.4) 0%,
  rgba(10, 22, 40, 0.6) 50%,
  rgba(10, 22, 40, 0.95) 100%
);

/* Gold metalik (CTA için opsiyonel) */
--gradient-gold: linear-gradient(
  135deg,
  #E8C77A 0%,
  #D4A744 50%,
  #B8902F 100%
);

/* Section divider gradient */
--gradient-divider: linear-gradient(
  90deg,
  transparent 0%,
  rgba(212, 167, 68, 0.4) 50%,
  transparent 100%
);
```

### Noise/Texture (opsiyonel ama lüksü güçlendirir)

`body` üzerine çok düşük opacity SVG noise: `opacity: 0.025;` — premium materyal hissi.

---

## 6. Component Spec'leri

### 6.1 Buttons

**Primary (Gold CTA):**
```
height: 48px (lg: 56px) / padding-x: 32px
background: var(--gold-500)
color: var(--navy-900)
font: Inter 600, 14px, letter-spacing 0.04em, UPPERCASE
border-radius: 9999px (pill)
hover: background var(--gold-400), translateY(-1px), box-shadow var(--glow-gold-md)
active: background var(--gold-600), translateY(0)
transition: all 200ms ease-out
```

**Secondary (Outline):**
```
height: 48px / padding-x: 32px
background: transparent
color: var(--gold-500)
border: 1px solid var(--gold-500)
border-radius: 9999px
hover: background rgba(212, 167, 68, 0.08)
```

**Ghost:**
```
background: transparent
color: var(--cream-100)
padding: 12px 20px
hover: background rgba(255, 255, 255, 0.04)
```

**Icon button:**
```
size: 40px square (or 9999px radius for circle)
background: rgba(20, 37, 64, 0.6)
icon color: var(--cream-100)
hover: background rgba(212, 167, 68, 0.15), icon var(--gold-500)
```

### 6.2 Inputs

```
height: 52px
background: rgba(255, 255, 255, 0.03)
border: 1px solid rgba(216, 220, 228, 0.12)
border-radius: 12px
padding: 0 20px
color: var(--cream-100)
placeholder: var(--silver-500)
font: Inter 400, 15px

focus:
  border-color: var(--gold-500)
  box-shadow: 0 0 0 3px rgba(212, 167, 68, 0.15)
  background: rgba(255, 255, 255, 0.05)

label (üstte):
  font: Inter 500, 12px, letter-spacing 0.08em, UPPERCASE
  color: var(--silver-400)
  margin-bottom: 8px

ikon (sol içinde):
  size: 20px
  color: var(--gold-500)
  margin-right: 12px
```

### 6.3 Listing Card (Önemli — sitenin omurgası)

**Dikey card (grid'de):**
```
width: 100% (parent grid)
background: var(--navy-850)
border: 1px solid rgba(212, 167, 68, 0.1)
border-radius: 16px
overflow: hidden
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)

[image area]
  aspect-ratio: 4/3
  position: relative
  fav button: top-right, 12px inset, 36px circle, glass background
  price overlay: bottom-left, 16px padding from edge,
    Playfair 600 22px, color var(--cream-50),
    text-shadow: 0 2px 8px rgba(0,0,0,0.6)

[info area]
  padding: 20px
  title: Inter 600 18px, color cream-50, 1-2 lines (line-clamp)
  location row: 6px gap, MapPin icon 14px gold, text body-sm silver-400
  meta row: 16px margin-top, divider'larla ayrılmış 3 öğe:
    "5 Yatak | 4 Banyo | 2,400 m²" — text caption, color cream-300
  CTA (opsiyonel): bottom, "İncele →" link gold-500

hover:
  border-color: rgba(212, 167, 68, 0.4)
  transform: translateY(-4px)
  box-shadow: var(--shadow-card-hover), var(--glow-gold-sm)
  image scale(1.05) içinde (overflow:hidden parent)
```

**Yatay card (öneri/featured carousel):**
- Image solda 40% genişlik, info sağda 60%
- Aynı renkler, daha geniş padding (24px)

### 6.4 Navigation Bar

**Desktop:**
```
height: 80px
background: rgba(10, 22, 40, 0.85) + backdrop-blur(20px)
border-bottom: 1px solid var(--border-subtle)
position: sticky, top: 0, z-index: 50

logo: solda, height 40px
menu: ortada (veya sağda), Inter 500 15px, color cream-100
  hover: color gold-500, underline animation (1px gold, scaleX 0→1)
CTA: sağda, "Müşteri Girişi" (Login) outline buton + "İletişim" primary
```

**Mobile:**
```
height: 64px
hamburger: 24px icon, sol
logo: ortada
profile/notif: sağda
mobile menu: slide-in from right, full height, var(--navy-900) bg
```

### 6.5 Hero Section

**Ana sayfa hero (Image 5 referansı):**
```
height: 100vh (max 800px desktop, 600px mobile)
background: büyük property fotoğrafı + gradient overlay
content: vertically + horizontally centered

overline: "** DISCOVER YOUR **" tarzı, gold-500, Inter overline scale
headline: Playfair display-2xl, cream-50, italik kelime varyasyonu
sub: body-lg cream-200, max-width 560px

search bar: hero altında 32px aşağıda, glass surface
  - Konum | Tür | Oda | Fiyat | [Ara] (5 kolon desktop)
  - Mobile: dikey stack
```

### 6.6 Footer

```
background: var(--navy-950)
padding: 80px 0 32px
border-top: 1px solid var(--border-subtle)

4 kolon grid:
  - Marka + kısa açıklama + sosyal ikonlar
  - Hızlı linkler
  - Hizmetler
  - İletişim

bottom bar:
  border-top: 1px solid var(--border-subtle)
  padding-top: 24px
  flex: copyright (sol) — legal links (sağ)
  text: body-sm var(--silver-500)
```

### 6.7 Badge / Tag

```
height: 24px / padding: 0 10px
border-radius: 9999px
font: label scale (12px, UC, ls 0.08em)

variants:
  - Satılık (sale):     bg rgba(74, 222, 128, 0.12), color #4ADE80
  - Kiralık (rent):     bg rgba(96, 165, 250, 0.12), color #60A5FA
  - Öne çıkan:           bg var(--gold-500), color var(--navy-900)
  - Yeni:               bg rgba(212, 167, 68, 0.15), color var(--gold-400)
  - Doğrulanmış:        gold-outline + check icon
```

### 6.8 Modal / Dialog

```
backdrop: var(--bg-overlay), backdrop-blur(8px)
container:
  background: var(--navy-850)
  border: 1px solid var(--border-default)
  border-radius: 16px
  max-width: 560px (lg: 720px)
  padding: 32px
  box-shadow: var(--shadow-modal)

header:
  Playfair display-sm, gold decorative line altında
  close X butonu sağda
```

### 6.9 Form (Kayıt/Giriş — Image 2 referansı)

Glass card içinde:
```
- max-width 440px
- centered (split-screen ise sağda)
- padding 40px
- background glass
- border gold-subtle

title: Playfair display-md, "Join Luna Estates" tarzı
sub: body cream-200

inputs: yukarıdaki input spec
divider'lar: "Ya da" text + iki yanda ince line
social buttons: 3 circular icon button, glass background
```

### 6.10 Admin Dashboard Card

```
background: var(--navy-850)
border: 1px solid var(--border-subtle)
border-radius: 12px
padding: 24px

header:
  title body Inter 600 14px UC ls 0.04em color silver-300
  optional menu icon sağda

chart area:
  Recharts default colors override:
    primary line/bar: var(--gold-500)
    secondary: var(--silver-300)
    grid: rgba(216, 220, 228, 0.06)
    text: var(--cream-300)
    tooltip bg: var(--navy-900), border gold-500
```

---

## 7. İkonografi

**Kütüphane:** `lucide-react` — line style, minimal.

**Boyutlar:**
- xs: 14px (inline metin yanında)
- sm: 16px (varsayılan UI)
- md: 20px (input, button)
- lg: 24px (nav, primary action)
- xl: 32px+ (feature blok)

**Strok:** 1.5px varsayılan (lucide-react `strokeWidth={1.5}`).

**Renk:**
- Default: `currentColor` (parent text color follow eder)
- Accent: `var(--gold-500)`
- Muted: `var(--silver-500)`

**Property-spesifik ikon haritası:**
| Özellik | Lucide ikon |
|---------|-------------|
| Yatak odası | `BedDouble` |
| Banyo | `Bath` |
| Alan (m²) | `Maximize2` veya `Square` |
| Otopark | `Car` |
| Asansör | `ChevronsUpDown` |
| Havuz | `Waves` |
| Balkon | `LayoutPanelTop` |
| Isıtma | `Flame` |
| Güvenlik | `ShieldCheck` |
| Konum | `MapPin` |
| Bina yaşı | `Calendar` |
| Kat | `Layers` |
| Eşyalı | `Sofa` |

---

## 8. Motion / Animasyon

**Genel prensip:** Yumuşak, premium, asla aşırı.

```css
--ease-out-soft: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1);

--duration-fast:   150ms;
--duration-normal: 200ms;
--duration-slow:   300ms;
--duration-deluxe: 500ms; /* hero entrance, modal */
```

**Hover'lar:** her zaman 200ms ease-out.
**Sayfa girişleri:** Framer Motion ile fade + 12px translateY, stagger 60ms.
**Image zoom:** card içi `scale(1.05)`, 400ms.
**Gold underline:** nav linklerinde `scaleX(0)` → `scaleX(1)` 200ms.

---

## 9. Responsive Davranış

**Mobile-first** Tailwind. Her component önce mobile, sonra `md:` ve `lg:` ile büyür.

**Tipografi:** 1 boyut küçült mobilde:
- `display-2xl` (88) → mobilde `display-lg` (48)
- `display-md` → mobilde 28px

**Spacing:** Section gap mobilde yarı kadar.

**Navigation:** Desktop'ta horizontal menu; tablet/mobile'da hamburger drawer.

**Listing grid:** 4→3→2→1 kolon (xl→lg→md→base).

---

## 10. Accessibility

- Tüm interaktif elementlerde `:focus-visible` outline: `2px solid var(--gold-500)` + `outline-offset: 2px`.
- Kontrast: cream-100 over navy-900 = AAA. gold-500 over navy-900 = AA Large.
- Tüm form input'larında `<label>` ve `aria-describedby` for help text.
- Skip-to-content link en üstte.
- Modal'larda focus trap + ESC ile kapanma.
- Image alt text Türkçe ve tanımlayıcı.

---

## 11. Tailwind v4 Kurulum (globals.css)

> **ÖNEMLİ:** Tailwind v4 ile artık `tailwind.config.ts` YOK. Tüm tema CSS'te `@theme` direktifi ile tanımlanır. Bu projede Tailwind v4 + Next.js 16 + PostCSS kombinasyonu kullanılır.

### `src/app/globals.css` (Tam İçerik)

```css
@import "tailwindcss";

/* ===== Dark mode için custom variant (Tailwind v4 yöntemi) ===== */
@custom-variant dark (&:where(.dark, .dark *));

/* ===== Theme tokens — @theme inline (next/font ile uyumlu) ===== */
@theme inline {
  /* === Renkler === */
  /* Navy spektrum */
  --color-navy-950: #050E1F;
  --color-navy-900: #0A1628;
  --color-navy-850: #0E1D33;
  --color-navy-800: #142540;
  --color-navy-700: #1B2F4E;
  --color-navy-600: #243C5F;
  --color-navy-500: #34527E;

  /* Gold spektrum */
  --color-gold-300: #E8C77A;
  --color-gold-400: #E0B85C;
  --color-gold-500: #D4A744;
  --color-gold-600: #B8902F;
  --color-gold-700: #8E6E1F;

  /* Silver/Pearl */
  --color-silver-300: #D8DCE4;
  --color-silver-400: #BFC4CE;
  --color-silver-500: #9098A6;

  /* Cream/Ivory */
  --color-cream-50:  #FAF7F0;
  --color-cream-100: #F5F1E8;
  --color-cream-200: #E8E3D5;
  --color-cream-300: #C9C2AE;

  /* === Fontlar (next/font'tan gelir) === */
  --font-display: var(--font-playfair);
  --font-sans:    var(--font-inter);
  --font-mono:    ui-monospace, "SF Mono", monospace;

  /* === Font Boyutları === */
  --text-display-2xl: 5.5rem;
  --text-display-2xl--line-height: 1.0;
  --text-display-2xl--letter-spacing: -0.04em;

  --text-display-xl: 4rem;
  --text-display-xl--line-height: 1.05;
  --text-display-xl--letter-spacing: -0.03em;

  --text-display-lg: 3rem;
  --text-display-lg--line-height: 1.1;
  --text-display-lg--letter-spacing: -0.02em;

  --text-display-md: 2.25rem;
  --text-display-md--line-height: 1.15;
  --text-display-md--letter-spacing: -0.02em;

  --text-display-sm: 1.75rem;
  --text-display-sm--line-height: 1.2;
  --text-display-sm--letter-spacing: -0.01em;

  /* === Border Radius === */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-2xl: 32px;

  /* === Shadows === */
  --shadow-card:        0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-card-hover:  0 8px 40px rgba(0, 0, 0, 0.55);
  --shadow-modal:       0 20px 60px rgba(0, 0, 0, 0.7);
  --shadow-glow-sm:     0 0 16px rgba(212, 167, 68, 0.15);
  --shadow-glow-md:     0 0 32px rgba(212, 167, 68, 0.25);
  --shadow-glow-lg:     0 8px 48px rgba(212, 167, 68, 0.35);
  --shadow-inner-gold:  inset 0 0 0 1px rgba(212, 167, 68, 0.2);

  /* === Backdrop blur === */
  --blur-xs: 4px;
  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
}

/* ===== Semantic CSS Variables (utility üretmez, sadece referans) ===== */
:root {
  --bg-canvas:        var(--color-navy-900);
  --bg-surface:       var(--color-navy-850);
  --bg-surface-hover: var(--color-navy-800);
  --bg-elevated:      var(--color-navy-800);
  --bg-overlay:       rgba(5, 14, 31, 0.85);

  --glass-bg:         rgba(20, 37, 64, 0.55);
  --glass-border:     rgba(212, 167, 68, 0.18);

  --text-primary:     var(--color-cream-50);
  --text-body:        var(--color-cream-100);
  --text-secondary:   var(--color-cream-300);
  --text-muted:       var(--color-silver-500);
  --text-accent:      var(--color-gold-500);
  --text-inverse:     var(--color-navy-900);

  --border-subtle:    rgba(212, 167, 68, 0.12);
  --border-default:   rgba(212, 167, 68, 0.25);
  --border-strong:    var(--color-gold-500);
  --border-divider:   rgba(216, 220, 228, 0.08);
}

/* ===== Base styles ===== */
@layer base {
  html {
    background: var(--bg-canvas);
    color: var(--text-body);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: var(--bg-canvas);
    color: var(--text-body);
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    color: var(--text-primary);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  ::selection {
    background: var(--color-gold-500);
    color: var(--color-navy-900);
  }

  :focus-visible {
    outline: 2px solid var(--color-gold-500);
    outline-offset: 2px;
    border-radius: 4px;
  }
}

/* ===== Utility helpers ===== */
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid var(--glass-border);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.06),
      0 4px 24px rgba(0, 0, 0, 0.4);
  }

  .text-balance { text-wrap: balance; }
}

/* ===== Animasyonlar ===== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

.animate-fade-up { animation: fadeUp 600ms cubic-bezier(0.4, 0, 0.2, 1); }
.animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
```

### `postcss.config.mjs` (zaten oluşturulmuş — sadece doğrula)

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

### Fontları yükleme — `src/app/layout.tsx`

```tsx
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin", "latin-ext"], // latin-ext Türkçe karakterler için kritik
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**Önemli:** Inter için `latin-ext` subset eklemek Türkçe karakterler (ç, ğ, ı, ö, ş, ü) için kritik, atlama.

### Kullanım Örnekleri (utility class'lar)

```tsx
// Renkler
<div className="bg-navy-900 text-cream-100" />
<span className="text-gold-500" />

// Tipografi
<h1 className="font-display text-display-xl">Hayalindeki Mülk</h1>
<p className="font-sans text-base">Açıklama metni</p>

// Border radius
<div className="rounded-lg" />

// Shadows
<div className="shadow-card hover:shadow-card-hover" />
<div className="shadow-glow-md" />

// Glass
<div className="glass rounded-xl p-6" />

// Backdrop blur
<div className="backdrop-blur-md" />
```

---

---

## 12. Component Yapım Sırası (Claude Code için)

Faz 1'de bu sırada üret:

1. `src/app/globals.css` — Tailwind v4 `@theme` bloğu (yukarıdaki tam içerik)
2. `src/app/layout.tsx` — next/font (Playfair + Inter) entegrasyonu
3. `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
4. `src/components/ui/button.tsx` — primary, secondary, ghost, icon variants
5. `src/components/ui/input.tsx` — label + icon + helper
6. `src/components/ui/card.tsx` — base + glass variants
7. `src/components/ui/badge.tsx` — variants
8. `src/components/layout/header.tsx`
9. `src/components/layout/footer.tsx`
10. `src/components/listing/listing-card.tsx`
11. `src/components/hero/home-hero.tsx`

> **NOT:** Tailwind v4'te `tailwind.config.ts` YOK. Tüm tema `globals.css` içinde `@theme` ile tanımlanır. Eğer Claude Code `tailwind.config.ts` oluşturmaya çalışırsa durdur, `globals.css`'e ekletmesi gerekir.

Her component için Storybook YOKSA en azından `/app/[locale]/_dev/page.tsx` altında bir showcase sayfası kur — tüm variantları orada gör.

---

## 13. "Yapma" Listesi

- ❌ Asla saf siyah (#000000). En koyusu `--navy-950`.
- ❌ Asla parlak saf beyaz (#FFFFFF) text. `--cream-50` kullan.
- ❌ Gold'u arka plana büyük alanlarda kullanma (göz yorar).
- ❌ Birden fazla aksan rengi (sarı + yeşil + mavi gibi).
- ❌ Drop shadow + glow aynı anda.
- ❌ Animasyon süreleri 500ms üstü (modal hariç).
- ❌ Border radius'ları karıştırma (bir component'te hep aynı veya tutarlı çiftler).
- ❌ Emoji ikonlar — sadece lucide-react.
- ❌ Stock görsel hissi veren generic ev fotoğrafları (mümkünse).
