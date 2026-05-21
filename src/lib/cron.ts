import { db } from "@/lib/db";
import { sendSearchAlertEmail } from "@/lib/email";

type AlertFilters = {
  category?: string;
  type?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: string[];
};

export async function checkSearchAlerts() {
  console.log("[cron] Arama alarmları kontrol ediliyor...");

  const alerts = await db.searchAlert.findMany({
    where: { active: true },
    include: { user: { select: { name: true, email: true } } },
  });

  if (alerts.length === 0) {
    console.log("[cron] Aktif alarm yok.");
    return;
  }

  const now = new Date();

  for (const alert of alerts) {
    const filters: AlertFilters = JSON.parse(alert.filters);

    // Frekansa göre tarih aralığı
    const since = new Date(now);
    if (alert.frequency === "weekly") {
      since.setDate(since.getDate() - 7);
    } else {
      since.setDate(since.getDate() - 1);
    }

    // Prisma where koşulu
    const where: Record<string, unknown> = {
      status: "ACTIVE",
      createdAt: { gte: since },
    };
    if (filters.category) where.category = filters.category;
    if (filters.type) where.type = filters.type;
    if (filters.district) where.district = filters.district;
    if (filters.rooms && filters.rooms.length > 0) {
      where.rooms = { in: filters.rooms };
    }
    if (filters.minPrice != null || filters.maxPrice != null) {
      where.price = {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      };
    }

    const matchingListings = await db.listing.findMany({
      where,
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        titleTr: true,
        price: true,
        currency: true,
        district: true,
      },
    });

    if (matchingListings.length === 0) continue;

    // In-app bildirim oluştur
    await db.notification.create({
      data: {
        userId: alert.userId,
        type: "new_listing_match",
        titleTr: `${matchingListings.length} yeni ilan: "${alert.name}"`,
        body: `Arama alarmanızla eşleşen ${matchingListings.length} yeni ilan bulundu.`,
        link: "/ilanlar",
        read: false,
      },
    });

    // Email gönder
    const formatted = matchingListings.map((l) => ({
      title: l.titleTr,
      slug: l.slug,
      district: l.district,
      price: new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: l.currency,
        maximumFractionDigits: 0,
      }).format(l.price.toNumber()),
    }));

    await sendSearchAlertEmail({
      to: alert.user.email,
      userName: alert.user.name,
      alertName: alert.name,
      listings: formatted,
    });

    console.log(`[cron] "${alert.name}" alarmı: ${matchingListings.length} eşleşme → ${alert.user.email}`);
  }

  console.log("[cron] Tamamlandı.");
}
