"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X, Video } from "lucide-react";

interface GalleryImage {
  url: string;
  alt: string | null;
  type?: "image" | "video";
}

interface ListingGalleryProps {
  images: GalleryImage[];
  title: string;
  children?: React.ReactNode;
}

function VideoThumb({ className }: { className?: string }) {
  return (
    <div className={`absolute inset-0 flex items-center justify-center bg-navy-800 ${className ?? ""}`}>
      <Video size={28} strokeWidth={1} className="text-silver-400" />
    </div>
  );
}

export default function ListingGallery({ images, title, children }: ListingGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const hasMultiple = images.length > 1;

  const prev = useCallback(
    () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length]
  );

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightbox ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightbox]);

  const currentItem = images[current];
  const isVideo = (item?: GalleryImage) => item?.type === "video";

  return (
    <>
      {/* ─── Hero carousel ─────────────────────────────────────────────────── */}
      <div className="relative h-[55vh] md:h-[65vh] bg-navy-800" tabIndex={-1}>
        {/* Ana medya */}
        {currentItem ? (
          isVideo(currentItem) ? (
            <video
              key={currentItem.url}
              src={currentItem.url}
              controls
              className="absolute inset-0 w-full h-full object-contain bg-navy-950"
            />
          ) : (
            <button
              onClick={() => setLightbox(true)}
              className="absolute inset-0 w-full cursor-zoom-in focus:outline-none"
              aria-label="Tam ekranda görüntüle"
            >
              <Image
                key={currentItem.url}
                src={currentItem.url}
                alt={currentItem.alt ?? title}
                fill
                priority={current === 0}
                sizes="100vw"
                className="object-cover"
              />
            </button>
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Maximize2 size={48} strokeWidth={1} className="text-navy-600" />
          </div>
        )}

        {/* Gradient overlay — sadece resimler için */}
        {!isVideo(currentItem) && (
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent pointer-events-none" />
        )}

        {/* Prev / Next */}
        {hasMultiple && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Önceki"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-navy-900/85 hover:border-gold-500/40 transition-colors">
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Sonraki"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm border border-white/10 text-white flex items-center justify-center hover:bg-navy-900/85 hover:border-gold-500/40 transition-colors">
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </>
        )}

        {/* Sayaç + Tam ekran butonu — alt sağ köşe */}
        <div className="absolute bottom-16 right-4 z-10 flex items-center gap-2">
          {hasMultiple && (
            <div className="px-2.5 py-1 rounded-full bg-navy-900/70 backdrop-blur-sm text-xs text-silver-300 tabular-nums pointer-events-none">
              {current + 1} / {images.length}
            </div>
          )}
          {currentItem && !isVideo(currentItem) && (
            <button onClick={() => setLightbox(true)} aria-label="Tam ekran"
              className="w-9 h-9 rounded-full bg-navy-900/70 backdrop-blur-sm border border-white/10 text-silver-300 flex items-center justify-center hover:text-cream-100 hover:border-gold-500/40 transition-colors">
              <Maximize2 size={15} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Slot: badge'ler */}
        {children}
      </div>

      {/* Thumbnail şeridi — gallery dışında, içerikle çakışmaz */}
      {hasMultiple && (
        <div className="bg-navy-800 px-5 lg:px-16 py-3 border-b border-[rgba(255,255,255,0.04)]">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Medya ${i + 1}`}
                className={`relative shrink-0 w-[72px] h-[50px] rounded-lg overflow-hidden transition-all duration-200 ${
                  i === current ? "ring-2 ring-gold-500 opacity-100" : "opacity-50 hover:opacity-80"
                }`}>
                {isVideo(img) ? (
                  <VideoThumb />
                ) : (
                  <Image src={img.url} alt={img.alt ?? `Görsel ${i + 1}`} fill sizes="72px" className="object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Lightbox (sadece resimler için) ───────────────────────────────── */}
      {lightbox && currentItem && !isVideo(currentItem) && (
        <div className="fixed inset-0 z-[100] bg-[rgba(5,12,25,0.97)] flex items-center justify-center"
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)} aria-label="Kapat"
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-navy-800/80 border border-white/10 text-silver-300 flex items-center justify-center hover:text-cream-100 hover:border-gold-500/40 transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>

          {hasMultiple && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-navy-800/70 text-xs text-silver-300 tabular-nums">
              {current + 1} / {images.length}
            </div>
          )}

          <div className="relative max-w-[90vw] max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}>
            <Image key={`lb-${currentItem.url}`} src={currentItem.url} alt={currentItem.alt ?? title}
              fill sizes="90vw" className="object-contain" priority />
          </div>

          {hasMultiple && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Önceki"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-navy-800/80 border border-white/10 text-white flex items-center justify-center hover:bg-navy-700/80 hover:border-gold-500/40 transition-colors">
                <ChevronLeft size={22} strokeWidth={1.5} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Sonraki"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-navy-800/80 border border-white/10 text-white flex items-center justify-center hover:bg-navy-700/80 hover:border-gold-500/40 transition-colors">
                <ChevronRight size={22} strokeWidth={1.5} />
              </button>
            </>
          )}

          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]">
              {images.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`relative shrink-0 w-14 h-10 rounded-lg overflow-hidden transition-all duration-150 ${
                    i === current ? "ring-2 ring-gold-500 opacity-100" : "opacity-40 hover:opacity-70"
                  }`}>
                  {isVideo(img) ? <VideoThumb /> : (
                    <Image src={img.url} alt={img.alt ?? `Görsel ${i + 1}`} fill sizes="56px" className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
