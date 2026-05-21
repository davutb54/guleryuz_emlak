import type { Metadata } from "next";
import { db } from "@/lib/db";
import GalleryClient from "@/components/gallery/gallery-client";

export const metadata: Metadata = {
  title: "Galeri & Anılarımız | Güleryüz Gayrimenkul",
  description:
    "Güleryüz Gayrimenkul'ün etkinlikleri, başarıları ve ofis hayatından kareler. Fotoğraf ve video galerimizi keşfedin.",
  openGraph: {
    title: "Galeri & Anılarımız | Güleryüz Gayrimenkul",
    description:
      "Güleryüz Gayrimenkul etkinlikleri, ekip fotoğrafları ve başarılarımızdan kareler.",
    type: "website",
  },
};

export default async function GaleriPage() {
  const items = await db.galleryItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      type: true,
      url: true,
      thumbnail: true,
      titleTr: true,
      descriptionTr: true,
      category: true,
      date: true,
      order: true,
    },
  });

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-900" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 70% 50%, #D4A744 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-gold-500 mb-4">
            Fotoğraf & Video
          </p>
          <h1 className="font-display text-display-lg md:text-display-xl text-cream-50 mb-6">
            Anılarımız
          </h1>
          <div className="w-16 h-px bg-gold-500 mx-auto mb-6" />
          <p className="font-sans text-silver-400 text-lg max-w-2xl mx-auto">
            Etkinliklerimizden, başarılarımızdan ve ofis hayatımızdan
            seçilmiş kareler.
          </p>
        </div>
      </section>

      {/* Galeri */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-2xl text-silver-500 mb-3">
                Henüz içerik eklenmedi
              </p>
              <p className="text-silver-500 font-sans text-sm">
                Yakında fotoğraf ve videolar burada yayınlanacak.
              </p>
            </div>
          ) : (
            <GalleryClient items={items} />
          )}
        </div>
      </section>
    </div>
  );
}
