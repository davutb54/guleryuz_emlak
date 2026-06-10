import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Calendar,
  Layers,
  Car,
  Flame,
  ShieldCheck,
  Waves,
  LayoutPanelTop,
  Sofa,
  Eye,
  ExternalLink,
} from "lucide-react";
import ViewCounter from "@/components/listing/view-counter";
import ListingGallery from "@/components/listing/listing-gallery";
import ListingMapClient from "@/components/listing/listing-map-client";
import SimilarListings from "@/components/listing/similar-listings";
import FavoriteButton from "@/components/listing/favorite-button";
import ShareButtons from "@/components/listing/share-buttons";
import CommentForm from "@/components/listing/comment-form";
import CommentList from "@/components/listing/comment-list";
import ListingQrCode from "@/components/listing/listing-qr-code";
import { Link } from "@/i18n/navigation";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://guleryuzgayrimenkul.com";

const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Ev / Daire",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan / İşyeri",
};
const TYPE_LABELS: Record<string, string> = { SALE: "Satılık", RENT: "Kiralık" };

function formatPrice(price: { toNumber(): number }, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price.toNumber());
}

// ─── Open Graph meta tag üretimi ────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const listing = await db.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    select: {
      titleTr: true,
      descriptionTr: true,
      district: true,
      price: true,
      currency: true,
      images: { where: { isPrimary: true }, select: { url: true }, take: 1 },
    },
  });

  if (!listing) return { title: "İlan Bulunamadı" };

  const pageUrl = `${BASE_URL}/tr/ilan/${slug}`;
  const ogImage = listing.images[0]
    ? { url: `${BASE_URL}${listing.images[0].url}`, width: 1200, height: 630 }
    : undefined;

  const priceStr = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: listing.currency,
    maximumFractionDigits: 0,
  }).format(listing.price.toNumber());

  return {
    title: `${listing.titleTr} — ${priceStr}`,
    description: `${listing.titleTr}, Eskişehir ${listing.district}. ${listing.descriptionTr.slice(0, 140)}…`,
    openGraph: {
      title: listing.titleTr,
      description: `${priceStr} — Eskişehir, ${listing.district}`,
      url: pageUrl,
      siteName: "Güleryüz Gayrimenkul",
      images: ogImage ? [ogImage] : [],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.titleTr,
      description: `${priceStr} — Eskişehir, ${listing.district}`,
      images: ogImage ? [ogImage.url] : [],
    },
  };
}

// ─── Sayfa ───────────────────────────────────────────────────────────────────
export default async function IlanDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [listing, session] = await Promise.all([
    db.listing.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" } },
        agent: { select: { name: true, phone: true, email: true } },
        features: true,
        comments: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
          select: { id: true, content: true, rating: true, createdAt: true, userId: true, user: { select: { name: true } } },
        },
      },
    }),
    auth(),
  ]);

  if (!listing) notFound();

  // Kullanıcı bu ilanı favorilemiş mi?
  let isFavorited = false;
  if (session?.user?.id) {
    const fav = await db.favorite.findUnique({
      where: {
        userId_listingId: { userId: session.user.id, listingId: listing.id },
      },
    });
    isFavorited = !!fav;
  }

  const galleryImages = listing.images.map((img) => ({
    url: img.url,
    alt: img.alt,
    type: img.type as "image" | "video",
  }));

  const boolFeatures = [
    { label: "Balkon", value: listing.hasBalcony, icon: LayoutPanelTop },
    { label: "Asansör", value: listing.hasElevator, icon: Layers },
    { label: "Otopark", value: listing.hasParking, icon: Car },
    { label: "Güvenlik", value: listing.hasSecurity, icon: ShieldCheck },
    { label: "Havuz", value: listing.hasPool, icon: Waves },
    { label: "Eşyalı", value: listing.furnished, icon: Sofa },
  ].filter((f) => f.value === true);

  const pageUrl = `${BASE_URL}/tr/ilan/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.titleTr,
    description: listing.descriptionTr,
    url: pageUrl,
    datePosted: listing.createdAt,
    ...(listing.images[0] && {
      image: `${BASE_URL}${listing.images[0].url}`,
    }),
    offers: {
      "@type": "Offer",
      price: listing.price.toNumber(),
      priceCurrency: listing.currency,
      availability:
        listing.status === "ACTIVE"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: listing.district,
      addressRegion: "Eskişehir",
      addressCountry: "TR",
    },
    ...(listing.latitude &&
      listing.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: listing.latitude,
          longitude: listing.longitude,
        },
      }),
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.area,
      unitCode: "MTK",
    },
    numberOfRooms: listing.rooms ?? undefined,
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* View sayacı (invisible) */}
      <ViewCounter listingId={listing.id} />

      {/* Hero görsel carousel */}
      <ListingGallery images={galleryImages} title={listing.titleTr}>
        {/* Tip + kategori badge */}
        <div className="absolute top-6 left-6 z-10 flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs font-semibold text-cream-100 uppercase tracking-wider">
            {TYPE_LABELS[listing.type]}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gold-500/20 backdrop-blur-sm text-xs font-semibold text-gold-400 uppercase tracking-wider">
            {CATEGORY_LABELS[listing.category]}
          </span>
        </div>

        {/* Sağ üst: görüntülenme + favori */}
        <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs text-silver-400">
            <Eye size={13} strokeWidth={1.5} />
            {listing.viewCount + 1} görüntülenme
          </div>
          <FavoriteButton
            listingId={listing.id}
            initialFavorited={isFavorited}
            size="md"
          />
        </div>
      </ListingGallery>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-16 pt-6 relative pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sol: Detaylar ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Başlık kutusu */}
            <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <h1 className="font-display text-display-sm text-cream-50 mb-3 break-words">
                {listing.titleTr}
              </h1>

              <div className="flex items-center gap-1.5 text-silver-400 text-sm mb-4">
                <MapPin size={14} strokeWidth={1.5} className="text-gold-500 shrink-0" />
                Eskişehir
                {listing.district && `, ${listing.district}`}
                {listing.neighborhood && ` / ${listing.neighborhood}`}
              </div>

              {/* Meta özellikleri */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-cream-200 text-sm">
                <span className="flex items-center gap-1.5">
                  <Maximize2 size={15} strokeWidth={1.5} className="text-gold-500" />
                  {listing.area} m²
                </span>
                {listing.netArea && (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={15} strokeWidth={1.5} className="text-silver-500" />
                    Net: {listing.netArea} m²
                  </span>
                )}
                {listing.rooms && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={15} strokeWidth={1.5} className="text-gold-500" />
                    {listing.rooms}
                  </span>
                )}
                {listing.bathrooms != null && (
                  <span className="flex items-center gap-1.5">
                    <Bath size={15} strokeWidth={1.5} className="text-gold-500" />
                    {listing.bathrooms} banyo
                  </span>
                )}
                {listing.buildingAge != null && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} strokeWidth={1.5} className="text-gold-500" />
                    {listing.buildingAge === 0 ? "Sıfır bina" : `${listing.buildingAge} yaşında`}
                  </span>
                )}
                {listing.floor != null && listing.totalFloors != null && (
                  <span className="flex items-center gap-1.5">
                    <Layers size={15} strokeWidth={1.5} className="text-gold-500" />
                    {listing.floor}. kat / {listing.totalFloors}
                  </span>
                )}
                {listing.heating && (
                  <span className="flex items-center gap-1.5">
                    <Flame size={15} strokeWidth={1.5} className="text-gold-500" />
                    {listing.heating}
                  </span>
                )}
              </div>
            </div>

            {/* Açıklama */}
            <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-4">
                Açıklama
              </h2>
              <p className="text-cream-200 text-[15px] leading-relaxed whitespace-pre-line break-words">
                {listing.descriptionTr}
              </p>
            </div>

            {/* Özellikler (boolean) */}
            {boolFeatures.length > 0 && (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-4">
                  Özellikler
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {boolFeatures.map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-navy-800 border border-[var(--border-subtle)]"
                    >
                      <Icon size={15} strokeWidth={1.5} className="text-gold-500" />
                      <span className="text-sm text-cream-200">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Arsa/tarla özellikleri */}
            {(listing.zoningStatus || listing.kaks || listing.taks || listing.islandNumber) && (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-4">
                  Tapu & İmar Bilgileri
                </h2>
                <dl className="grid grid-cols-2 gap-3">
                  {listing.zoningStatus && (
                    <div>
                      <dt className="text-xs text-silver-500 mb-1">İmar Durumu</dt>
                      <dd className="text-sm text-cream-100">{listing.zoningStatus}</dd>
                    </div>
                  )}
                  {listing.deedStatus && (
                    <div>
                      <dt className="text-xs text-silver-500 mb-1">Tapu Durumu</dt>
                      <dd className="text-sm text-cream-100">{listing.deedStatus}</dd>
                    </div>
                  )}
                  {listing.kaks != null && (
                    <div>
                      <dt className="text-xs text-silver-500 mb-1">KAKS (Emsal)</dt>
                      <dd className="text-sm text-cream-100">{listing.kaks}</dd>
                    </div>
                  )}
                  {listing.islandNumber && (
                    <div>
                      <dt className="text-xs text-silver-500 mb-1">Ada / Parsel</dt>
                      <dd className="text-sm text-cream-100">
                        {listing.islandNumber} / {listing.parcelNumber}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Konum */}
            {(listing.latitude && listing.longitude) && (
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider">
                    Konum
                  </h2>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold-500/35 text-gold-500 text-xs font-medium hover:bg-gold-500/8 transition-colors"
                  >
                    <MapPin size={12} strokeWidth={1.5} />
                    Yol Tarifi Al
                  </a>
                </div>
                <div className="h-64 rounded-xl overflow-hidden border border-[var(--border-subtle)]">
                  <ListingMapClient
                    listings={[{
                      id: listing.id,
                      slug: listing.slug,
                      titleTr: listing.titleTr,
                      price: listing.price.toNumber(),
                      currency: listing.currency,
                      district: listing.district,
                      neighborhood: listing.neighborhood ?? null,
                      latitude: listing.latitude,
                      longitude: listing.longitude,
                      images: listing.images.slice(0, 1).map(img => ({ url: img.url, alt: img.alt ?? null })),
                    }]}
                    center={[listing.latitude, listing.longitude]}
                    zoom={15}
                  />
                </div>
              </div>
            )}

            {/* Yorumlar */}
            <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-6">
                Yorumlar
                {listing.comments.length > 0 && (
                  <span className="ml-2 text-gold-500">({listing.comments.length})</span>
                )}
              </h2>

              <div className="mb-8">
                <CommentList
                  comments={listing.comments}
                  currentUserId={session?.user?.id ?? null}
                  isAdmin={["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role ?? "")}
                />
              </div>

              <div className="border-t border-[rgba(216,220,228,0.06)] pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-4">
                  Yorum Yaz
                </p>
                <CommentForm
                  listingId={listing.id}
                  isLoggedIn={!!session?.user?.id}
                />
              </div>
            </div>
          </div>

          {/* ─── Sağ: Fiyat + İletişim ─────────────────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Fiyat kutusu */}
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-600 mb-1">
                  Fiyat
                </p>
                <p className="font-display text-display-md text-cream-50 tabular-nums">
                  {formatPrice(listing.price, listing.currency)}
                </p>
                {listing.creditEligible && (
                  <p className="text-xs text-green-400 mt-2">✓ Krediye uygun</p>
                )}

                {/* Favori + Paylaş satırı */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(216,220,228,0.06)]">
                  <FavoriteButton
                    listingId={listing.id}
                    initialFavorited={isFavorited}
                    size="md"
                  />
                  <ShareButtons url={pageUrl} title={listing.titleTr} />
                </div>
              </div>

              {/* Acente iletişim */}
              <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-silver-400 mb-3">
                  İlan Sahibi
                </p>
                <p className="text-cream-100 font-medium mb-4">{listing.agent.name}</p>

                {listing.agent.phone && (
                  <a
                    href={`tel:${listing.agent.phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors mb-3"
                  >
                    Ara: {listing.agent.phone}
                  </a>
                )}

                <Link
                  href="/iletisim"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gold-500/40 text-gold-500 font-medium text-sm hover:bg-gold-500/8 transition-colors mb-3"
                >
                  Mesaj Gönder
                </Link>

                {listing.sahibindenUrl && (
                  <a
                    href={listing.sahibindenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#ffe800] text-black font-semibold text-sm hover:brightness-95 transition-all mb-3"
                  >
                    Sahibinden'de İncele
                  </a>
                )}

                <ListingQrCode url={pageUrl} />
              </div>

              {/* Sanal tur */}
              {listing.virtualTourUrl && (
                <a
                  href={listing.virtualTourUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--border-subtle)] text-silver-300 text-sm hover:text-cream-100 hover:border-silver-400 transition-colors"
                >
                  <ExternalLink size={15} strokeWidth={1.5} />
                  Sanal Turu Görüntüle
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Benzer İlanlar */}
      <div className="max-w-[1440px] mx-auto px-5 lg:px-16 pb-16">
        <SimilarListings
          id={listing.id}
          category={listing.category as string}
          type={listing.type as string}
          district={listing.district}
          price={listing.price.toNumber()}
          rooms={listing.rooms}
        />
      </div>
    </div>
  );
}
