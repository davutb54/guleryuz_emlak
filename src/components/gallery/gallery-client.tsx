"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Calendar,
  Film,
} from "lucide-react";

export type GalleryItem = {
  id: string;
  type: string;
  url: string;
  thumbnail: string | null;
  titleTr: string | null;
  descriptionTr: string | null;
  category: string | null;
  date: Date | null;
  order: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  achievement: "Başarılar",
  event: "Etkinlikler",
  office: "Ofisimiz",
  team: "Ekibimiz",
};

const ALL_TABS = [
  { key: "all", label: "Tümü" },
  { key: "image", label: "Fotoğraflar" },
  { key: "video", label: "Videolar" },
  { key: "achievement", label: "Başarılar" },
  { key: "event", label: "Etkinlikler" },
  { key: "office", label: "Ofisimiz" },
  { key: "team", label: "Ekibimiz" },
];

function getYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  );
  return m ? m[1] : null;
}

function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

function getEmbedUrl(url: string): string | null {
  const ytId = getYoutubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?autoplay=1`;
  const vimeoId = getVimeoId(url);
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  return null;
}

function getAutoThumbnail(url: string): string | null {
  const ytId = getYoutubeId(url);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

function formatDate(date: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
  }).format(new Date(date));
}

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [activeTab, setActiveTab] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Filtrelenmiş yalnızca görüntülenecek öğeler
  const filtered = items.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "image" || activeTab === "video")
      return item.type === activeTab;
    return item.category === activeTab;
  });

  const images = filtered.filter((i) => i.type === "image");

  const openLightbox = (item: GalleryItem) => {
    const imgIndex = images.findIndex((i) => i.id === item.id);
    if (imgIndex >= 0) setLightboxIndex(imgIndex);
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : i === 0 ? images.length - 1 : i - 1
      ),
    [images.length]
  );
  const nextImage = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : i === images.length - 1 ? 0 : i + 1
      ),
    [images.length]
  );

  useEffect(() => {
    if (lightboxIndex === null && !videoUrl) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeLightbox();
        setVideoUrl(null);
      }
      if (lightboxIndex !== null) {
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, videoUrl, closeLightbox, prevImage, nextImage]);

  useEffect(() => {
    const isOpen = lightboxIndex !== null || videoUrl !== null;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, videoUrl]);

  // Sekmelerde içerik var mı?
  const visibleTabs = ALL_TABS.filter((tab) => {
    if (tab.key === "all") return true;
    if (tab.key === "image") return items.some((i) => i.type === "image");
    if (tab.key === "video") return items.some((i) => i.type === "video");
    return items.some((i) => i.category === tab.key);
  });

  return (
    <>
      {/* Filtre sekmeleri */}
      {visibleTabs.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full font-sans text-sm transition-all ${
                activeTab === tab.key
                  ? "bg-gold-500 text-navy-900 font-semibold"
                  : "bg-navy-800 border border-navy-700 text-silver-400 hover:border-gold-500/40 hover:text-gold-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Boş durum */}
      {filtered.length === 0 && (
        <div className="text-center py-24">
          <p className="text-silver-500 font-sans">
            Bu kategoride henüz içerik bulunmuyor.
          </p>
        </div>
      )}

      {/* Masonry grid — CSS columns */}
      {filtered.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid mb-4 group relative overflow-hidden rounded-xl border border-navy-700 hover:border-gold-500/40 transition-all cursor-pointer"
              onClick={() =>
                item.type === "video"
                  ? setVideoUrl(item.url)
                  : openLightbox(item)
              }
            >
              {item.type === "image" ? (
                <div className="relative">
                  <Image
                    src={item.url}
                    alt={item.titleTr ?? "Galeri görseli"}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video bg-navy-800">
                  {(() => {
                    const thumb = item.thumbnail ?? getAutoThumbnail(item.url);
                    return thumb ? (
                      <Image
                        src={thumb}
                        alt={item.titleTr ?? "Video"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-navy-800 to-navy-950 flex flex-col items-center justify-center gap-2">
                        <Film className="w-10 h-10 text-navy-600" strokeWidth={1} />
                        {item.titleTr && (
                          <p className="text-xs text-silver-600 px-4 text-center line-clamp-2">
                            {item.titleTr}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                  {/* Play butonu overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-gold-500/90 group-hover:bg-gold-400 flex items-center justify-center transition-colors shadow-lg">
                      <Play className="w-6 h-6 text-navy-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-navy-950/20 group-hover:bg-navy-950/10 transition-colors" />
                </div>
              )}

              {/* Alt bilgi */}
              {(item.titleTr || item.date || item.category) && (
                <div className="p-3 bg-navy-800">
                  {item.titleTr && (
                    <p className="font-sans text-sm text-cream-200 font-medium truncate">
                      {item.titleTr}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.category && CATEGORY_LABELS[item.category] && (
                      <span className="text-xs text-gold-500 font-sans">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    )}
                    {item.date && (
                      <span className="flex items-center gap-1 text-xs text-silver-500 font-sans">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox — fotoğraf */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Kapat */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-cream-100 z-10"
            onClick={closeLightbox}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Önceki */}
          {images.length > 1 && (
            <button
              className="absolute left-4 w-10 h-10 rounded-full bg-navy-800/80 hover:bg-navy-700 flex items-center justify-center text-cream-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Görsel */}
          <div
            className="max-w-5xl max-h-[85vh] w-full mx-16 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].titleTr ?? "Galeri"}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            {images[lightboxIndex].titleTr && (
              <p className="text-center text-silver-400 text-sm font-sans mt-3">
                {images[lightboxIndex].titleTr}
              </p>
            )}
          </div>

          {/* Sonraki */}
          {images.length > 1 && (
            <button
              className="absolute right-4 w-10 h-10 rounded-full bg-navy-800/80 hover:bg-navy-700 flex items-center justify-center text-cream-100 z-10"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Sayaç */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-navy-800/80 rounded-full px-4 py-1.5 text-xs text-silver-400 font-sans">
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      {/* Video modal */}
      {videoUrl && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/95 flex items-center justify-center p-4"
          onClick={() => setVideoUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-navy-800 hover:bg-navy-700 flex items-center justify-center text-cream-100 z-10"
            onClick={() => setVideoUrl(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            {getEmbedUrl(videoUrl) ? (
              <iframe
                src={getEmbedUrl(videoUrl)!}
                className="w-full h-full rounded-xl"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-xl"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
