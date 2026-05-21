import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  MapPin,
  Maximize2,
  Star,
  UserCircle2,
  Bell,
} from "lucide-react";
import SearchAlertForm from "@/components/listing/search-alert-form";
import DeleteSearchAlertButton from "@/components/listing/delete-search-alert-button";
import AvatarUpload from "@/components/shared/avatar-upload";
import ProfileEditForm from "@/components/shared/profile-edit-form";

function formatPrice(price: { toNumber(): number }, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price.toNumber());
}

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/giris`);
  }

  const userId = session.user.id;

  const [user, favorites, comments, searchAlerts] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true, avatar: true, createdAt: true },
    }),
    db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            slug: true,
            titleTr: true,
            price: true,
            currency: true,
            district: true,
            area: true,
            status: true,
            images: {
              where: { isPrimary: true },
              select: { url: true, alt: true },
              take: 1,
            },
          },
        },
      },
    }),
    db.comment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { titleTr: true, slug: true } },
      },
    }),
    db.searchAlert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) redirect(`/${locale}/giris`);

  return (
    <div className="min-h-screen bg-navy-900 py-12">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-16">
        {/* Başlık */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-2">
            Hesabım
          </p>
          <div className="flex items-center gap-4">
            <AvatarUpload currentAvatar={user.avatar} currentName={user.name} />
            <div>
              <h1 className="font-display text-display-sm text-cream-50">
                {user.name}
              </h1>
              <p className="text-silver-500 text-sm">{user.email}</p>
              {user.phone && (
                <p className="text-silver-500 text-xs mt-0.5">{user.phone}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <ProfileEditForm name={user.name} phone={user.phone ?? null} avatar={user.avatar ?? null} />
                <p className="text-silver-600 text-xs">Fotoğrafa tıkla → değiştir</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Favoriler ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 lg:row-span-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-silver-300 mb-5">
              <Heart size={15} strokeWidth={1.5} className="text-gold-500" />
              Favori İlanlarım
              <span className="text-gold-500">({favorites.length})</span>
            </h2>

            {favorites.length === 0 ? (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-10 text-center">
                <Heart size={32} strokeWidth={1} className="text-navy-700 mx-auto mb-3" />
                <p className="text-silver-500 text-sm mb-4">
                  Henüz favorilediğiniz ilan yok.
                </p>
                <Link
                  href="/ilanlar"
                  className="inline-block px-5 py-2.5 rounded-full border border-gold-500/40 text-gold-500 text-sm hover:bg-gold-500/8 transition-colors"
                >
                  İlanları Gözat
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map(({ listing, createdAt }) => {
                  const img = listing.images[0];
                  const isActive = listing.status === "ACTIVE";

                  return (
                    <Link
                      key={listing.id}
                      href={isActive ? `/ilan/${listing.slug}` : "/ilanlar"}
                      className={`flex gap-4 bg-navy-850 border border-[rgba(212,167,68,0.1)] rounded-xl p-4 transition-all hover:border-[rgba(212,167,68,0.35)] hover:-translate-y-0.5 group ${!isActive ? "opacity-60" : ""}`}
                    >
                      {/* Küçük görsel */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-navy-800 shrink-0">
                        {img ? (
                          <Image
                            src={img.url}
                            alt={img.alt ?? listing.titleTr}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Maximize2 size={20} strokeWidth={1} className="text-navy-600" />
                          </div>
                        )}
                      </div>

                      {/* Bilgi */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-cream-100 font-medium text-sm line-clamp-1 mb-1 group-hover:text-cream-50 transition-colors">
                          {listing.titleTr}
                        </h3>
                        <div className="flex items-center gap-1 text-silver-500 text-xs mb-1">
                          <MapPin size={11} strokeWidth={1.5} className="text-gold-600" />
                          Eskişehir, {listing.district}
                        </div>
                        <p className="font-display text-gold-500 text-[15px] font-semibold">
                          {formatPrice(listing.price, listing.currency)}
                        </p>
                        {!isActive && (
                          <span className="text-[10px] text-silver-600 uppercase tracking-wider">
                            Pasif ilan
                          </span>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs text-silver-600">
                          {new Date(createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Arama Alarmlarım ──────────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-silver-300">
                <Bell size={15} strokeWidth={1.5} className="text-gold-500" />
                Arama Alarmlarım
                <span className="text-gold-500">({searchAlerts.length}/10)</span>
              </h2>
              <SearchAlertForm />
            </div>

            {searchAlerts.length === 0 ? (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-8 text-center">
                <Bell size={28} strokeWidth={1} className="text-navy-700 mx-auto mb-3" />
                <p className="text-silver-500 text-sm mb-1">Henüz arama alarmınız yok.</p>
                <p className="text-silver-600 text-xs">Yeni ilan eklendiğinde email ve bildirim alın.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchAlerts.map((alert) => {
                  const filters = JSON.parse(alert.filters) as Record<string, unknown>;
                  const filterParts: string[] = [];
                  if (filters.category === "HOUSE") filterParts.push("Daire");
                  else if (filters.category === "LAND") filterParts.push("Arsa");
                  else if (filters.category === "FIELD") filterParts.push("Tarla");
                  else if (filters.category === "SHOP") filterParts.push("Dükkan");
                  if (filters.type === "SALE") filterParts.push("Satılık");
                  else if (filters.type === "RENT") filterParts.push("Kiralık");
                  if (filters.district) filterParts.push(String(filters.district));
                  if (filters.minPrice) filterParts.push(`Min ${Number(filters.minPrice).toLocaleString("tr-TR")}₺`);
                  if (filters.maxPrice) filterParts.push(`Max ${Number(filters.maxPrice).toLocaleString("tr-TR")}₺`);

                  return (
                    <div
                      key={alert.id}
                      className={`bg-navy-850 border rounded-xl p-4 flex flex-col gap-3 ${
                        alert.active
                          ? "border-[rgba(212,167,68,0.12)]"
                          : "border-[rgba(255,255,255,0.05)] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-cream-100 font-medium text-sm line-clamp-1">{alert.name}</p>
                          <p className="text-silver-500 text-xs mt-0.5">
                            {alert.frequency === "weekly" ? "Haftalık" : "Günlük"} bildirim
                          </p>
                        </div>
                        <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          alert.active ? "bg-green-500/10 text-green-400" : "bg-silver-500/10 text-silver-500"
                        }`}>
                          {alert.active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      {filterParts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {filterParts.map((p) => (
                            <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-navy-800 text-silver-400 border border-[rgba(255,255,255,0.06)]">
                              {p}
                            </span>
                          ))}
                        </div>
                      )}
                      <DeleteSearchAlertButton alertId={alert.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─── Yorumlarım ────────────────────────────────────────────────── */}
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-silver-300 mb-5">
              <MessageSquare size={15} strokeWidth={1.5} className="text-gold-500" />
              Yorumlarım
              <span className="text-gold-500">({comments.length})</span>
            </h2>

            {comments.length === 0 ? (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-8 text-center">
                <MessageSquare size={28} strokeWidth={1} className="text-navy-700 mx-auto mb-3" />
                <p className="text-silver-500 text-sm">
                  Henüz yorum yapmadınız.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Link
                        href={`/ilan/${comment.listing.slug}`}
                        className="text-cream-200 text-xs font-medium line-clamp-1 hover:text-gold-400 transition-colors"
                      >
                        {comment.listing.titleTr}
                      </Link>
                      <span
                        className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                          comment.approved
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {comment.approved ? "Yayında" : "Bekliyor"}
                      </span>
                    </div>
                    {comment.rating && (
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={11}
                            strokeWidth={1.5}
                            className={
                              s <= comment.rating!
                                ? "fill-gold-500 text-gold-500"
                                : "text-navy-600"
                            }
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-silver-400 text-xs line-clamp-2">
                      {comment.content}
                    </p>
                    <p className="text-silver-600 text-[10px] mt-2">
                      {new Date(comment.createdAt).toLocaleDateString("tr-TR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
