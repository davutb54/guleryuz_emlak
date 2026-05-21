import type { Metadata } from "next";
import { db } from "@/lib/db";
import HomeHero from "@/components/hero/home-hero";
import ListingCard from "@/components/listing/listing-card";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Güleryüz Gayrimenkul — Eskişehir Emlak",
  description:
    "Eskişehir'de satılık ve kiralık ev, arsa, tarla, dükkan ilanları. 15 yılı aşkın deneyimle güvenilir gayrimenkul hizmeti.",
  openGraph: {
    title: "Güleryüz Gayrimenkul — Eskişehir",
    description:
      "Eskişehir'de satılık ve kiralık ev, arsa, tarla, dükkan ilanları.",
    type: "website",
  },
};

export default async function HomePage() {
  const featured = await db.listing.findMany({
    where: { status: "ACTIVE", featured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      slug: true,
      titleTr: true,
      price: true,
      currency: true,
      district: true,
      category: true,
      type: true,
      area: true,
      rooms: true,
      bathrooms: true,
      featured: true,
      images: {
        where: { isPrimary: true },
        select: { url: true, isPrimary: true, alt: true },
        take: 1,
      },
    },
  });

  const total = await db.listing.count({ where: { status: "ACTIVE" } });

  return (
    <>
      <HomeHero />

      {featured.length > 0 && (
        <section className="bg-navy-900 py-16 px-5 lg:px-16">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 mb-1">
                  Seçkin İlanlar
                </p>
                <h2 className="font-display text-display-md text-cream-50">
                  Öne Çıkan Gayrimenkuller
                </h2>
              </div>
              <Link
                href="/ilanlar"
                className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
              >
                Tüm İlanlar
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {featured.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={false}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/ilanlar"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-gold-500/40 text-gold-500 font-medium text-sm hover:bg-gold-500/8 transition-colors"
              >
                {total > 6 ? `${total} ilanın tümünü gör` : "Tüm İlanları Gör"}
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {featured.length === 0 && (
        <section className="bg-navy-900 py-16 px-5 lg:px-16">
          <div className="max-w-[1440px] mx-auto text-center">
            <p className="text-silver-500 text-sm mb-4">Henüz öne çıkan ilan yok.</p>
            <Link
              href="/ilanlar"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-gold-500/40 text-gold-500 font-medium text-sm hover:bg-gold-500/8 transition-colors"
            >
              Tüm İlanları Görüntüle
              <ArrowRight size={15} strokeWidth={1.5} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
