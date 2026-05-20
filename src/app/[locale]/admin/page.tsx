import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ListFilter, Users, MessageSquare, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  const [listingCount, userCount, pendingComments, activeListings] =
    await Promise.all([
      db.listing.count(),
      db.user.count(),
      db.comment.count({ where: { approved: false } }),
      db.listing.count({ where: { status: "ACTIVE" } }),
    ]);

  const stats = [
    {
      label: "Toplam İlan",
      value: listingCount,
      icon: ListFilter,
      href: "/admin/ilanlar",
      color: "text-gold-500",
    },
    {
      label: "Aktif İlan",
      value: activeListings,
      icon: TrendingUp,
      href: "/admin/ilanlar",
      color: "text-green-400",
    },
    {
      label: "Kullanıcı",
      value: userCount,
      icon: Users,
      href: "/admin/kullanicilar",
      color: "text-blue-400",
    },
    {
      label: "Onay Bekleyen Yorum",
      value: pendingComments,
      icon: MessageSquare,
      href: "/admin/yorumlar",
      color: "text-amber-400",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-md text-cream-50">
          Hoş geldiniz, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-silver-500 mt-1">Güleryüz Gayrimenkul Yönetim Paneli</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="block bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-5 hover:border-gold-500/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon size={20} strokeWidth={1.5} className={color} />
              <span className="text-xs font-medium text-silver-400 uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className="font-display text-3xl text-cream-50 tabular-nums">
              {value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
        <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-4">
          Hızlı Erişim
        </h2>
        <div className="flex flex-wrap gap-3">
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
        </div>
      </div>
    </div>
  );
}
