import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { ListFilter, Users, MessageSquare, TrendingUp, Eye, Mail } from "lucide-react";
import DashboardCharts from "@/components/admin/dashboard-charts";

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Ev/Daire",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:   { label: "Aktif",      color: "#4ADE80" },
  DRAFT:    { label: "Taslak",     color: "#9098A6" },
  PENDING:  { label: "Beklemede",  color: "#FBBF24" },
  SOLD:     { label: "Satıldı",    color: "#60A5FA" },
  RENTED:   { label: "Kiralandı",  color: "#C084FC" },
  ARCHIVED: { label: "Arşiv",      color: "#475569" },
};

function buildDailyData(listings: Date[], users: Date[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  return days.map((day) => {
    const label = day.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
    const isDay = (d: Date) =>
      d.getFullYear() === day.getFullYear() &&
      d.getMonth() === day.getMonth() &&
      d.getDate() === day.getDate();
    return {
      gun: label,
      ilan: listings.filter(isDay).length,
      uye: users.filter(isDay).length,
    };
  });
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (session?.user?.role === "AGENT") {
    redirect("/admin/ilanlar");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalListings,
    activeListings,
    totalUsers,
    pendingComments,
    totalViews,
    unreadMessages,
    recentListings,
    recentUsers,
    categoryCounts,
    statusCounts,
    topListings,
  ] = await Promise.all([
    db.listing.count(),
    db.listing.count({ where: { status: "ACTIVE" } }),
    db.user.count(),
    db.comment.count({ where: { approved: false } }),
    db.listing.aggregate({ _sum: { viewCount: true } }),
    db.contactMessage.count({ where: { read: false } }),
    db.listing.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    db.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    }),
    db.listing.groupBy({ by: ["category"], _count: { id: true } }),
    db.listing.groupBy({ by: ["status"], _count: { id: true } }),
    db.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { titleTr: true, viewCount: true, slug: true, district: true },
    }),
  ]);

  const dailyData = buildDailyData(
    recentListings.map((l) => l.createdAt),
    recentUsers.map((u) => u.createdAt)
  );

  const categoryData = categoryCounts.map((c) => ({
    name: CATEGORY_LABELS[c.category] ?? c.category,
    value: c._count.id,
  }));

  const statusData = statusCounts.map((s) => ({
    name: STATUS_LABELS[s.status]?.label ?? s.status,
    value: s._count.id,
    color: STATUS_LABELS[s.status]?.color ?? "#9098A6",
  }));

  const statCards = [
    { label: "Toplam İlan",    value: totalListings,   icon: ListFilter,    href: "/admin/ilanlar",     color: "text-gold-500" },
    { label: "Aktif İlan",     value: activeListings,  icon: TrendingUp,    href: "/admin/ilanlar",     color: "text-green-400" },
    { label: "Toplam Görüntülenme", value: (totalViews._sum.viewCount ?? 0), icon: Eye, href: "/admin/ilanlar", color: "text-blue-400" },
    { label: "Kullanıcı",      value: totalUsers,      icon: Users,         href: "/admin/kullanicilar", color: "text-purple-400" },
    { label: "Gizli Yorum",    value: pendingComments, icon: MessageSquare, href: "/admin/yorumlar?gorunum=gizli", color: "text-amber-400" },
    { label: "Okunmamış Mesaj", value: unreadMessages, icon: Mail,          href: "/admin/iletisim",   color: "text-red-400" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-md text-cream-50">
          Hoş geldiniz, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-silver-500 mt-1">Güleryüz Gayrimenkul Yönetim Paneli</p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="block bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5 hover:border-gold-500/30 transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon size={18} strokeWidth={1.5} className={color} />
              <span className="text-[11px] font-medium text-silver-400 uppercase tracking-wider leading-tight">
                {label}
              </span>
            </div>
            <p className="font-display text-3xl text-cream-50 tabular-nums">{value}</p>
          </Link>
        ))}
      </div>

      {/* Grafikler */}
      <DashboardCharts dailyData={dailyData} categoryData={categoryData} statusData={statusData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* En çok görüntülenen ilanlar */}
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5">
          <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider mb-4">
            En Çok Görüntülenen (Aktif)
          </p>
          {topListings.length === 0 ? (
            <p className="text-silver-500 text-sm">Henüz aktif ilan yok.</p>
          ) : (
            <ol className="space-y-2">
              {topListings.map((l, i) => (
                <li key={l.slug} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-silver-500 w-4 shrink-0">{i + 1}.</span>
                    <Link
                      href={`/ilan/${l.slug}`}
                      className="text-sm text-cream-200 hover:text-gold-400 transition-colors truncate"
                    >
                      {l.titleTr}
                    </Link>
                    <span className="text-xs text-silver-600 shrink-0">{l.district}</span>
                  </div>
                  <span className="text-sm text-gold-500 font-medium tabular-nums shrink-0">
                    {l.viewCount.toLocaleString("tr-TR")}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Hızlı erişim */}
        <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5">
          <p className="text-xs font-semibold text-silver-300 uppercase tracking-wider mb-4">
            Hızlı Erişim
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/ilanlar/yeni"
              className="px-4 py-2 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
            >
              + Yeni İlan Ekle
            </Link>
            <Link
              href="/admin/ilanlar"
              className="px-4 py-2 rounded-full border border-gold-500/40 text-gold-500 text-sm font-medium hover:bg-gold-500/8 transition-colors"
            >
              İlanları Yönet
            </Link>
            <Link
              href="/admin/kullanicilar"
              className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-cream-300 text-sm font-medium hover:bg-white/4 transition-colors"
            >
              Kullanıcılar
            </Link>
            <Link
              href="/admin/iletisim"
              className="px-4 py-2 rounded-full border border-[var(--border-subtle)] text-cream-300 text-sm font-medium hover:bg-white/4 transition-colors"
            >
              Mesajlar {unreadMessages > 0 && `(${unreadMessages})`}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
