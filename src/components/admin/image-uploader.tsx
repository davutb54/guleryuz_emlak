"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, X, Loader2 } from "lucide-react";

export type UploadedImage = {
  url: string;       // DB'ye kaydedilen tam URL
  thumbnail: string; // admin UI önizlemesi için (thumb WebP)
  isPrimary: boolean;
  order: number;
};

interface ImageUploaderProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

async function uploadFile(
  file: File
): Promise<{ url: string; thumbnail: string } | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  return res.json();
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;

    setError(null);
    setUploadingCount((n) => n + fileArr.length);

    const results = await Promise.all(fileArr.map(uploadFile));
    const successful = results.filter(Boolean) as { url: string; thumbnail: string }[];

    if (successful.length < fileArr.length) {
      setError(`${fileArr.length - successful.length} görsel yüklenemedi.`);
    }

    if (successful.length > 0) {
      const startOrder = value.length;
      const newImages: UploadedImage[] = successful.map((r, i) => ({
        url: r.url,
        thumbnail: r.thumbnail,
        isPrimary: value.length === 0 && i === 0,
        order: startOrder + i,
      }));
      onChange([...value, ...newImages]);
    }

    setUploadingCount((n) => n - fileArr.length);
  }

  function setPrimary(idx: number) {
    onChange(value.map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  function remove(idx: number) {
    const removedWasPrimary = value[idx]?.isPrimary ?? false;
    const filtered = value
      .filter((_, i) => i !== idx)
      .map((img, i) => ({ ...img, order: i, isPrimary: false as boolean }));

    // Silinen primary idiyse kalan ilk görseli primary yap
    if (removedWasPrimary && filtered.length > 0) {
      filtered[0] = { ...filtered[0], isPrimary: true };
    }
    onChange(filtered);
  }

  const isUploading = uploadingCount > 0;

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${
          dragOver
            ? "border-gold-500 bg-gold-500/5"
            : "border-[rgba(212,167,68,0.25)] hover:border-gold-500/50 hover:bg-white/[0.02]"
        }`}
      >
        {isUploading ? (
          <Loader2 size={28} strokeWidth={1.5} className="text-gold-500 animate-spin" />
        ) : (
          <ImagePlus size={28} strokeWidth={1.5} className="text-silver-500" />
        )}
        <p className="text-sm text-silver-400">
          {isUploading
            ? `${uploadingCount} görsel yükleniyor…`
            : "Fotoğraf eklemek için tıklayın veya sürükleyin"}
        </p>
        <p className="text-xs text-silver-600">JPG, PNG, WebP · Maks 10 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Thumbnail grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {value.map((img, i) => (
            <div key={img.url} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-navy-800">
              <Image
                src={img.thumbnail}
                alt={`Görsel ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {/* Primary yıldız */}
                <button
                  type="button"
                  onClick={() => setPrimary(i)}
                  title="Ana fotoğraf yap"
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                    img.isPrimary
                      ? "bg-gold-500 text-navy-900"
                      : "bg-navy-900/70 text-silver-300 hover:bg-gold-500/20 hover:text-gold-400"
                  }`}
                >
                  <Star size={13} strokeWidth={2} fill={img.isPrimary ? "currentColor" : "none"} />
                </button>

                {/* Sil */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  title="Kaldır"
                  className="w-7 h-7 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gold-500 text-navy-900">
                  Ana
                </div>
              )}
            </div>
          ))}

          {/* Yükleniyor placeholder'ları */}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`uploading-${i}`} className="aspect-[4/3] rounded-lg bg-navy-800 border border-[rgba(212,167,68,0.12)] flex items-center justify-center">
              <Loader2 size={18} strokeWidth={1.5} className="text-gold-500 animate-spin" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
