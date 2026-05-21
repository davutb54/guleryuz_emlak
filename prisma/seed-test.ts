import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "@node-rs/argon2";

const dbUrl = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Test verisi ekleniyor...\n");

  // ─── 1. SUPER_ADMIN ────────────────────────────────
  const adminPw = await hash("GuleryuzAdmin2026!", { memoryCost: 65536, timeCost: 3, parallelism: 1, outputLen: 32 });
  const admin = await db.user.upsert({
    where: { email: "admin@guleryuzgayrimenkul.com" },
    update: {},
    create: {
      email: "admin@guleryuzgayrimenkul.com",
      passwordHash: adminPw,
      name: "Sistem Yöneticisi",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // ─── 2. TEST KULLANICISI ───────────────────────────
  const userPw = await hash("Test1234!", { memoryCost: 65536, timeCost: 3, parallelism: 1, outputLen: 32 });
  const testUser = await db.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      passwordHash: userPw,
      name: "Ahmet Yılmaz",
      role: "USER",
      emailVerified: new Date(),
    },
  });
  console.log(`✅ Test kullanıcısı: ${testUser.email} / Test1234!`);

  // ─── 3. SiteSettings ───────────────────────────────
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      contactEmail: "info@guleryuzgayrimenkul.com",
      contactPhone: "+90 222 000 00 00",
      address: "Hoşnudiye Mahallesi, Atatürk Caddesi No:12, Odunpazarı/Eskişehir",
      workingHours: "Pazartesi–Cumartesi: 09:00–18:00",
      socialLinks: JSON.stringify({ instagram: "", facebook: "", youtube: "", whatsapp: "" }),
      aboutTr: "Güleryüz Gayrimenkul, Eskişehir'de yıllardır güvenilir ve kaliteli emlak hizmeti sunmaktadır.",
      aboutEn: "Güleryüz Real Estate has been providing reliable and quality real estate services in Eskişehir for years.",
    },
  });

  // ─── 4. İLANLAR ────────────────────────────────────
  const listings = [
    {
      slug: "modern-daire-odunpazari-3-1",
      category: "HOUSE" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Odunpazarı'nda Modern 3+1 Daire",
      titleEn: "Modern 3+1 Apartment in Odunpazarı",
      descriptionTr: "Odunpazarı'nın tarihi dokusuna yakın, yeni yapı modern bir daire. Geniş salon, ebeveyn banyosu, balkon ve otopark dahildir. Toplu taşımaya yürüme mesafesinde.",
      descriptionEn: "Modern apartment near Odunpazarı historic district. Spacious living room, en-suite bathroom, balcony and parking included.",
      price: 3850000,
      city: "Eskişehir",
      district: "Odunpazarı",
      neighborhood: "Hoşnudiye",
      area: 135,
      netArea: 120,
      rooms: "3+1",
      bathrooms: 2,
      buildingAge: 3,
      floor: 4,
      totalFloors: 8,
      heating: "Doğalgaz Kombi",
      hasBalcony: true,
      hasElevator: true,
      hasParking: true,
      inSite: true,
      creditEligible: true,
      deedStatus: "Kat Mülkiyeti",
      featured: true,
      latitude: 39.7767,
      longitude: 30.5206,
    },
    {
      slug: "tepebaşi-satilik-villa-4-1",
      category: "HOUSE" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Tepebaşı'nda Satılık 4+1 Villa",
      titleEn: "4+1 Villa for Sale in Tepebaşı",
      descriptionTr: "Tepebaşı'nda müstakil bahçeli villa. 4+1, 3 banyo, kapalı garaj, yüzme havuzu. Site içinde güvenlikli.",
      descriptionEn: "Detached villa with garden in Tepebaşı. 4+1, 3 bathrooms, closed garage, swimming pool in a secured compound.",
      price: 9500000,
      city: "Eskişehir",
      district: "Tepebaşı",
      neighborhood: "Yenikent",
      area: 280,
      netArea: 250,
      rooms: "4+1",
      bathrooms: 3,
      buildingAge: 5,
      floor: 0,
      totalFloors: 2,
      heating: "Merkezi",
      hasBalcony: true,
      hasElevator: false,
      hasParking: true,
      hasPool: true,
      inSite: true,
      hasSecurity: true,
      creditEligible: true,
      deedStatus: "Kat Mülkiyeti",
      featured: true,
      latitude: 39.7950,
      longitude: 30.5100,
    },
    {
      slug: "odunpazari-kiralık-2-1-daire",
      category: "HOUSE" as const,
      type: "RENT" as const,
      status: "ACTIVE" as const,
      titleTr: "Odunpazarı Merkez 2+1 Kiralık Daire",
      titleEn: "2+1 Apartment for Rent in Odunpazarı Center",
      descriptionTr: "Odunpazarı merkezde, ulaşım noktalara yakın, eşyalı 2+1 daire. 1. katta, asansörsüz bina.",
      descriptionEn: "Furnished 2+1 apartment in Odunpazarı center, close to transport hubs.",
      price: 12000,
      city: "Eskişehir",
      district: "Odunpazarı",
      neighborhood: "Kırmızıtoprak",
      area: 90,
      netArea: 80,
      rooms: "2+1",
      bathrooms: 1,
      buildingAge: 12,
      floor: 1,
      totalFloors: 5,
      heating: "Doğalgaz Kombi",
      furnished: true,
      hasBalcony: true,
      hasElevator: false,
      hasParking: false,
      creditEligible: false,
      deedStatus: "Kat Mülkiyeti",
      featured: false,
      latitude: 39.7720,
      longitude: 30.5180,
    },
    {
      slug: "tepebaşi-imarlı-arsa-satılık",
      category: "LAND" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Tepebaşı'nda İmarlı Arsa",
      titleEn: "Zoned Land in Tepebaşı",
      descriptionTr: "Tepebaşı ilçesinde, ana yola cepheli, konut imarlı arsa. Uygun konumu ile yatırımlık.",
      descriptionEn: "Residential zoned land on main road in Tepebaşı district. Investment opportunity.",
      price: 2200000,
      city: "Eskişehir",
      district: "Tepebaşı",
      neighborhood: "Batıkent",
      area: 450,
      zoningStatus: "Konut İmarlı",
      kaks: 1.5,
      taks: 0.35,
      islandNumber: "214",
      parcelNumber: "8",
      featured: false,
      latitude: 39.8000,
      longitude: 30.4950,
    },
    {
      slug: "sivrihisar-tarla-satılık",
      category: "FIELD" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Sivrihisar'da Tarla",
      titleEn: "Agricultural Land in Sivrihisar",
      descriptionTr: "Sivrihisar ilçesinde, sulanabilir tarla. Yola cepheli, tapulu.",
      descriptionEn: "Irrigable agricultural land in Sivrihisar. Road frontage, titled.",
      price: 450000,
      city: "Eskişehir",
      district: "Sivrihisar",
      area: 5000,
      zoningStatus: "Tarla",
      islandNumber: "112",
      parcelNumber: "23",
      featured: false,
      latitude: 39.4500,
      longitude: 31.5350,
    },
    {
      slug: "odunpazari-satilik-dükkan",
      category: "SHOP" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Odunpazarı'nda Satılık Dükkan",
      titleEn: "Shop for Sale in Odunpazarı",
      descriptionTr: "Odunpazarı alışveriş aksında, cadde üzeri satılık dükkan. Aktif müşteri potansiyeli.",
      descriptionEn: "Shop on main commercial street in Odunpazarı. Active customer base.",
      price: 1800000,
      city: "Eskişehir",
      district: "Odunpazarı",
      neighborhood: "Hoşnudiye",
      area: 65,
      ceilingHeight: 3.2,
      storefrontWidth: 4.5,
      deedStatus: "Kat Mülkiyeti",
      featured: true,
      latitude: 39.7740,
      longitude: 30.5220,
    },
    {
      slug: "tepebaşi-1-1-kiralık-stüdyo",
      category: "HOUSE" as const,
      type: "RENT" as const,
      status: "ACTIVE" as const,
      titleTr: "Tepebaşı'nda 1+1 Kiralık Daire",
      titleEn: "1+1 Apartment for Rent in Tepebaşı",
      descriptionTr: "Üniversiteye yakın 1+1, temiz bina, güvenlik kameralı.",
      descriptionEn: "1+1 near university, clean building, security cameras.",
      price: 8500,
      city: "Eskişehir",
      district: "Tepebaşı",
      neighborhood: "Uluönder",
      area: 55,
      netArea: 48,
      rooms: "1+1",
      bathrooms: 1,
      buildingAge: 8,
      floor: 2,
      totalFloors: 6,
      heating: "Doğalgaz Kombi",
      hasElevator: true,
      hasParking: false,
      hasSecurity: true,
      featured: false,
      latitude: 39.8020,
      longitude: 30.5080,
    },
    {
      slug: "odunpazari-3-1-satilik-bahceli",
      category: "HOUSE" as const,
      type: "SALE" as const,
      status: "ACTIVE" as const,
      titleTr: "Odunpazarı'nda Bahçeli 3+1 Ev",
      titleEn: "3+1 House with Garden in Odunpazarı",
      descriptionTr: "Müstakil bahçeli 3+1 ev. Geniş bahçe, kapalı mutfak, 2 banyo.",
      descriptionEn: "Detached 3+1 house with private garden. Spacious garden, closed kitchen, 2 bathrooms.",
      price: 5200000,
      city: "Eskişehir",
      district: "Odunpazarı",
      neighborhood: "Şirintepe",
      area: 180,
      netArea: 160,
      rooms: "3+1",
      bathrooms: 2,
      buildingAge: 15,
      floor: 0,
      totalFloors: 2,
      heating: "Doğalgaz Kombi",
      hasBalcony: false,
      hasParking: true,
      featured: false,
      latitude: 39.7690,
      longitude: 30.5290,
    },
  ];

  const createdListings: string[] = [];

  for (const listing of listings) {
    const { slug, price, area, netArea, ...rest } = listing;
    const existing = await db.listing.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  ⚪ Mevcut: ${slug}`);
      createdListings.push(existing.id);
      continue;
    }

    const created = await db.listing.create({
      data: {
        slug,
        price,
        area,
        netArea,
        agentId: admin.id,
        viewCount: Math.floor(Math.random() * 500) + 50,
        ...rest,
        images: {
          create: [
            {
              url: "/uploads/placeholder-1.webp",
              isPrimary: true,
              order: 0,
              alt: listing.titleTr,
            },
          ],
        },
      },
    });
    createdListings.push(created.id);
    console.log(`  ✅ İlan: ${slug}`);
  }

  // ─── 5. YORUMLAR ───────────────────────────────────
  const comments = [
    { listingId: createdListings[0], content: "Çok güzel bir daire, iç mekan fotoğrafları gerçeği yansıtıyor. Sahibinden çok memnun kaldık.", rating: 5, approved: true },
    { listingId: createdListings[0], content: "Konumu biraz gürültülü ama genel olarak iyi. Fiyatı piyasa değerinde.", rating: 4, approved: true },
    { listingId: createdListings[0], content: "İlanı gezmek istiyorum, nasıl randevu alabilirim?", rating: null, approved: false },
    { listingId: createdListings[1], content: "Villa gerçekten muhteşem. Site içi olması büyük artı.", rating: 5, approved: true },
    { listingId: createdListings[2], content: "Eşyalı olması çok pratik. Taşınma kolayı.", rating: 4, approved: true },
    { listingId: createdListings[5], content: "Dükkanın konumu cadde üzerinde, trafik yoğunluğu iyi. Yatırıma uygun.", rating: null, approved: false },
  ];

  for (const c of comments) {
    if (!c.listingId) continue;
    await db.comment.create({
      data: {
        userId: testUser.id,
        listingId: c.listingId,
        content: c.content,
        rating: c.rating ?? null,
        approved: c.approved,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`✅ ${comments.length} yorum eklendi (${comments.filter(c => !c.approved).length} onay bekliyor)`);

  // ─── 6. FAVORİLER ──────────────────────────────────
  for (const listingId of createdListings.slice(0, 3)) {
    await db.favorite.upsert({
      where: { userId_listingId: { userId: testUser.id, listingId } },
      update: {},
      create: { userId: testUser.id, listingId },
    });
  }
  console.log("✅ 3 favori eklendi (test kullanıcısı)");

  // ─── 7. BİLDİRİMLER ────────────────────────────────
  const notifications = [
    {
      type: "new_listing_match",
      titleTr: "Arama Alarmanız Eşleşti",
      body: "Odunpazarı'nda yeni bir 3+1 satılık daire ilanı eklendi.",
      link: "/tr/ilan/modern-daire-odunpazari-3-1",
      read: false,
    },
    {
      type: "comment_approved",
      titleTr: "Yorumunuz Onaylandı",
      body: "Modern 3+1 Daire ilanına yazdığınız yorum yayınlandı.",
      link: "/tr/ilan/modern-daire-odunpazari-3-1",
      read: false,
    },
    {
      type: "price_drop",
      titleTr: "Fiyat Düştü",
      body: "Favorilediğiniz Tepebaşı 4+1 Villa ilanının fiyatı güncellendi.",
      link: "/tr/ilan/tepebaşi-satilik-villa-4-1",
      read: true,
    },
  ];

  for (const n of notifications) {
    await db.notification.create({
      data: { userId: testUser.id, ...n, createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) },
    });
  }
  console.log(`✅ ${notifications.length} bildirim eklendi`);

  // ─── 8. ARAMA ALARMLARI ────────────────────────────
  const alerts = [
    {
      name: "Odunpazarı Satılık 3+1",
      filters: JSON.stringify({ category: "HOUSE", type: "SALE", district: "Odunpazarı", rooms: ["3+1"] }),
      frequency: "daily",
      active: true,
    },
    {
      name: "Tepebaşı Kiralık Daire",
      filters: JSON.stringify({ category: "HOUSE", type: "RENT", district: "Tepebaşı", maxPrice: 15000 }),
      frequency: "weekly",
      active: true,
    },
  ];

  for (const a of alerts) {
    await db.searchAlert.create({ data: { userId: testUser.id, ...a } });
  }
  console.log(`✅ ${alerts.length} arama alarmı eklendi`);

  // ─── 9. İLETİŞİM MESAJLARI ────────────────────────
  const messages = [
    {
      name: "Fatma Kaya",
      email: "fatma.kaya@example.com",
      phone: "0532 111 22 33",
      subject: "Odunpazarı daire hakkında",
      message: "Merhaba, Odunpazarı'ndaki 3+1 daire için randevu almak istiyorum. Müsait olduğunuz gün/saat var mı?",
      read: false,
    },
    {
      name: "Mehmet Demir",
      email: "mehmet.demir@example.com",
      phone: "0533 444 55 66",
      subject: "Tepebaşı villa fiyat pazarlığı",
      message: "Villa için teklif vermek istiyorum. Biraz daha konuşabilir miyiz?",
      read: false,
    },
    {
      name: "Ayşe Çelik",
      email: "ayse.celik@example.com",
      phone: null,
      subject: null,
      message: "Genel olarak Eskişehir'de yatırımlık arsa arıyorum. Portföyünüzde neler var?",
      read: true,
    },
  ];

  for (const m of messages) {
    await db.contactMessage.create({
      data: { ...m, createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) },
    });
  }
  console.log(`✅ ${messages.length} iletişim mesajı eklendi`);

  // ─── 10. FİYAT GEÇMİŞİ ────────────────────────────
  if (createdListings[0]) {
    for (const [price, dateStr] of [
      [4200000, "2026-01-15"],
      [4000000, "2026-03-01"],
      [3850000, "2026-05-01"],
    ] as [number, string][]) {
      await db.priceHistory.create({
        data: { listingId: createdListings[0], price, changedAt: new Date(dateStr) },
      });
    }
    console.log("✅ Fiyat geçmişi eklendi (1. ilan)");
  }

  // ─── ÖZET ─────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("  TEST VERİSİ HAZIR");
  console.log("════════════════════════════════════════════");
  console.log("\n  ADMIN GİRİŞİ:");
  console.log("  E-posta : admin@guleryuzgayrimenkul.com");
  console.log("  Şifre   : GuleryuzAdmin2026!");
  console.log("\n  TEST KULLANICISI:");
  console.log("  E-posta : test@test.com");
  console.log("  Şifre   : Test1234!");
  console.log("\n  EKLENENLER:");
  console.log(`  • ${listings.length} ilan (HOUSE, LAND, FIELD, SHOP)`);
  console.log(`  • ${comments.length} yorum (${comments.filter(c => !c.approved).length} onay bekliyor)`);
  console.log("  • 3 favori");
  console.log(`  • ${notifications.length} bildirim (2 okunmamış)`);
  console.log(`  • ${alerts.length} arama alarmı`);
  console.log(`  • ${messages.length} iletişim mesajı`);
  console.log("  • Fiyat geçmişi (1. ilan)");
  console.log("════════════════════════════════════════════");
}

main()
  .catch((e) => { console.error("❌ Seed hatası:", e); process.exit(1); })
  .finally(() => db.$disconnect());
