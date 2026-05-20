"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface GalleryImage {
  url: string;
  alt: string | null;
}

interface ListingGalleryProps {
  images: GalleryImage[];
  title: string;
  children?: React.ReactNode; // badge'ler ve view counter için slot
}

export default function ListingGallery({
  images,
  title,
  children,
}: ListingGalleryProps) {
  const [current, setCurrent] = useState(0);
  const hasMultiple = images.length > 1;

  const prev = useCallback(
    () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

  const currentImage = images[current];

  return (
    <div
      className="relative h-[55vh] md:h-[65vh] bg-navy-800"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
      }}
      tabIndex={-1}
    >
      {/* Ana görsel */}
      {currentImage ? (
        <Image
          key={currentImage.url}
          src={currentImage.url}
          alt={currentImage.alt ?? title}
          fill
          priority={current === 0}
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Maximize2 size={48} strokeWidth={1} className="text-navy-600" />
        </div>
      )}

      {/* Gradient overlay — thumbnail şeridini de kapsar */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />

      {/* Prev / Next okları */}
      {hasMultiple && (
        <>
          <button
            onClick={prev}
            aria-label="Önceki görsel"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-navy-900/85 hover:border-gold-500/40 transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            aria-label="Sonraki görsel"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-navy-900/85 hover:border-gold-500/40 transition-colors"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Sayaç (sağ üst) — view count badge'i varsa onun soluna kayar */}
      {hasMultiple && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs text-silver-300 tabular-nums">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Thumbnail şeridi — hero'nun alt kısmında */}
      {hasMultiple && (
        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 lg:px-16 pb-3 pt-6">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Görsel ${i + 1}`}
                className={`relative shrink-0 w-[72px] h-[50px] rounded-lg overflow-hidden transition-all duration-200 ${
                  i === current
                    ? "ring-2 ring-gold-500 opacity-100"
                    : "opacity-50 hover:opacity-80"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? `Görsel ${i + 1}`}
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slot: badge'ler, view counter — absolute konumlanır */}
      {children}
    </div>
  );
}
