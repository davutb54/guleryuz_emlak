import { Link } from "@/i18n/navigation";
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
  listing: {
    id: string;
    slug: string;
    titleTr: string;
    price: { toNumber(): number };
    currency: string;
    district: string;
    category: string;
    type: string;
    area: number;
    rooms?: string | null;
    bathrooms?: number | null;
    featured: boolean;
    images: { url: string; isPrimary: boolean; alt?: string | null }[];
  };
}

const TYPE_LABELS: Record<string, string> = { SALE: "Satılık", RENT: "Kiralık" };
const CATEGORY_LABELS: Record<string, string> = {
  HOUSE: "Daire",
  LAND: "Arsa",
  FIELD: "Tarla",
  SHOP: "Dükkan",
};

function formatPrice(price: { toNumber(): number }, currency: string) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price.toNumber());
}

export default function ListingCard({ listing }: ListingCardProps) {
  const primaryImage =
    listing.images.find((i) => i.isPrimary) ?? listing.images[0];

  return (
    <Link
      href={`/ilan/${listing.slug}`}
      className="group block bg-navy-850 border border-[rgba(212,167,68,0.1)] rounded-[16px] overflow-hidden transition-all duration-300 hover:border-[rgba(212,167,68,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_16px_rgba(212,167,68,0.15)]"
    >
      {/* Görsel */}
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-800">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt ?? listing.titleTr}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-400 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Maximize2 size={32} strokeWidth={1} className="text-navy-600" />
          </div>
        )}

        {/* Fiyat overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
          <p className="font-display text-[22px] text-cream-50 font-semibold tabular-nums [text-shadow:0_2px_8px_rgba(0,0,0,0.6)]">
            {formatPrice(listing.price, listing.currency)}
          </p>
        </div>

        {/* Öne çıkan badge */}
        {listing.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gold-500 text-navy-900 text-[11px] font-bold uppercase tracking-wider">
            Öne Çıkan
          </div>
        )}

        {/* Tür badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-navy-900/70 backdrop-blur-sm text-cream-100">
          {TYPE_LABELS[listing.type] ?? listing.type}
        </div>
      </div>

      {/* Bilgi */}
      <div className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-600 mb-1">
          {CATEGORY_LABELS[listing.category] ?? listing.category}
        </p>

        <h3 className="text-cream-50 font-semibold text-[17px] leading-snug line-clamp-2 mb-3">
          {listing.titleTr}
        </h3>

        {/* Konum */}
        <div className="flex items-center gap-1.5 text-silver-400 text-sm mb-3">
          <MapPin size={14} strokeWidth={1.5} className="text-gold-500 shrink-0" />
          <span className="truncate">Eskişehir, {listing.district}</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-cream-300 text-[13px] pt-3 border-t border-[rgba(216,220,228,0.06)]">
          {listing.rooms && (
            <>
              <span className="flex items-center gap-1">
                <BedDouble size={13} strokeWidth={1.5} className="text-silver-500" />
                {listing.rooms}
              </span>
              <span className="text-silver-600">·</span>
            </>
          )}

          {listing.bathrooms != null && (
            <>
              <span className="flex items-center gap-1">
                <Bath size={13} strokeWidth={1.5} className="text-silver-500" />
                {listing.bathrooms}
              </span>
              <span className="text-silver-600">·</span>
            </>
          )}

          <span className="flex items-center gap-1">
            <Maximize2 size={13} strokeWidth={1.5} className="text-silver-500" />
            {listing.area} m²
          </span>
        </div>
      </div>
    </Link>
  );
}
