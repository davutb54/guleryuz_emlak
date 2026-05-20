import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import Image from "next/image";
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
import { Link } from "@/i18n/navigation";

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

export default async function IlanDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const listing = await db.listing.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      agent: { select: { name: true, phone: true, email: true } },
      features: true,
    },
  });

  if (!listing) notFound();

  const primaryImage =
    listing.images.find((i) => i.isPrimary) ?? listing.images[0];

  const boolFeatures = [
    { label: "Balkon", value: listing.hasBalcony, icon: LayoutPanelTop },
    { label: "Asansör", value: listing.hasElevator, icon: Layers },
    { label: "Otopark", value: listing.hasParking, icon: Car },
    { label: "Güvenlik", value: listing.hasSecurity, icon: ShieldCheck },
    { label: "Havuz", value: listing.hasPool, icon: Waves },
    { label: "Eşyalı", value: listing.furnished, icon: Sofa },
  ].filter((f) => f.value === true);

  return (
    <div className="min-h-screen bg-navy-900">
      {/* View sayacı (invisible) */}
      <ViewCounter listingId={listing.id} />

      {/* Hero görsel */}
      <div className="relative h-[55vh] md:h-[65vh] bg-navy-800">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? listing.titleTr}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Maximize2 size={48} strokeWidth={1} className="text-navy-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />

        {/* Tip + kategori badge */}
        <div className="absolute top-6 left-6 flex gap-2">
          <span className="px-3 py-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs font-semibold text-cream-100 uppercase tracking-wider">
            {TYPE_LABELS[listing.type]}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-gold-500/20 backdrop-blur-sm text-xs font-semibold text-gold-400 uppercase tracking-wider">
            {CATEGORY_LABELS[listing.category]}
          </span>
        </div>

        {/* View count */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs text-silver-400">
          <Eye size={13} strokeWidth={1.5} />
          {listing.viewCount + 1} görüntülenme
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-16 -mt-16 relative pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Sol: Detaylar ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Başlık kutusu */}
            <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6 mb-6">
              <h1 className="font-display text-display-sm text-cream-50 mb-3">
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
              <p className="text-cream-200 text-[15px] leading-relaxed whitespace-pre-line">
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

            {/* Harita placeholder */}
            <div className="bg-navy-850 border border-[var(--border-subtle)] rounded-xl p-6">
              <h2 className="text-sm font-semibold text-silver-300 uppercase tracking-wider mb-4">
                Konum
              </h2>
              {listing.latitude && listing.longitude ? (
                <div className="h-48 rounded-lg bg-navy-800 border border-[var(--border-subtle)] flex items-center justify-center text-silver-500 text-sm">
                  <MapPin size={20} className="mr-2 text-gold-500" />
                  Harita — Faz 3'te Leaflet eklenecek
                </div>
              ) : (
                <p className="text-silver-500 text-sm">Konum bilgisi mevcut değil.</p>
              )}
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
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-gold-500/40 text-gold-500 font-medium text-sm hover:bg-gold-500/8 transition-colors"
                >
                  Mesaj Gönder
                </Link>
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
    </div>
  );
}
