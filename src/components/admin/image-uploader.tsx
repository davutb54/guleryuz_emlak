"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Star, X, Loader2, Video, ChevronUp, ChevronDown } from "lucide-react";

export type UploadedImage = {
  url: string;
  thumbnail: string | null;
  type: "image" | "video";
  isPrimary: boolean;
  order: number;
};

interface ImageUploaderProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}

async function uploadFile(file: File): Promise<{ url: string; thumbnail: string | null; type: "image" | "video" } | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  if (!res.ok) return null;
  return res.json();
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | File[]) {
    const fileArr = Array.from(files);
    if (!fileArr.length) return;

    setError(null);
    setUploadingCount((n) => n + fileArr.length);

    const results = await Promise.all(fileArr.map(uploadFile));
    const successful = results.filter(Boolean) as { url: string; thumbnail: string | null; type: "image" | "video" }[];

    if (successful.length < fileArr.length) {
      setError(`${fileArr.length - successful.length} dosya yüklenemedi.`);
    }

    if (successful.length > 0) {
      const startOrder = value.length;
      const newItems: UploadedImage[] = successful.map((r, i) => ({
        url: r.url,
        thumbnail: r.thumbnail,
        type: r.type,
        isPrimary: value.length === 0 && i === 0 && r.type === "image",
        order: startOrder + i,
      }));
      onChange([...value, ...newItems]);
    }

    setUploadingCount((n) => n - fileArr.length);
  }

  function setPrimary(idx: number) {
    if (value[idx]?.type === "video") return;
    onChange(value.map((item, i) => ({ ...item, isPrimary: i === idx })));
  }

  function remove(idx: number) {
    const removedWasPrimary = value[idx]?.isPrimary ?? false;
    const filtered = value
      .filter((_, i) => i !== idx)
      .map((item, i) => ({ ...item, order: i, isPrimary: false as boolean }));
    if (removedWasPrimary && filtered.length > 0) {
      const firstImage = filtered.findIndex((i) => i.type === "image");
      if (firstImage >= 0) filtered[firstImage] = { ...filtered[firstImage], isPrimary: true };
    }
    onChange(filtered);
  }

  function moveItem(idx: number, dir: "up" | "down") {
    const newValue = [...value];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newValue.length) return;
    [newValue[idx], newValue[swapIdx]] = [newValue[swapIdx], newValue[idx]];
    onChange(newValue.map((item, i) => ({ ...item, order: i })));
  }

  const isUploading = uploadingCount > 0;

  return (
    <div className="space-y-3">
      {/* Dropzone — sadece resimler için */}
      <div
        onClick={() => imageInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-7 cursor-pointer transition-colors ${
          dragOver
            ? "border-gold-500 bg-gold-500/5"
            : "border-[rgba(212,167,68,0.25)] hover:border-gold-500/50 hover:bg-white/[0.02]"
        }`}
      >
        {isUploading ? (
          <Loader2 size={24} strokeWidth={1.5} className="text-gold-500 animate-spin" />
        ) : (
          <ImagePlus size={24} strokeWidth={1.5} className="text-silver-500" />
        )}
        <p className="text-sm text-silver-400">
          {isUploading ? `${uploadingCount} dosya yükleniyor…` : "Fotoğraf ekle — tıklayın veya sürükleyin"}
        </p>
        <p className="text-xs text-silver-600">JPG, PNG, WebP · Maks 10 MB</p>
      </div>

      {/* Video yükleme butonu */}
      <label className="flex items-center justify-center gap-2 border border-[rgba(212,167,68,0.2)] rounded-xl py-3 cursor-pointer text-sm text-silver-400 hover:border-gold-500/40 hover:text-cream-100 transition-colors">
        <Video size={16} strokeWidth={1.5} className="shrink-0" />
        Video Ekle (MP4, WebM · Maks 50 MB)
        <input ref={videoInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </label>

      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Medya grid */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-silver-500 uppercase tracking-wider">Medya Sıralaması</p>
          {value.map((item, i) => (
            <div key={item.url}
              className="flex items-center gap-3 bg-navy-800 border border-[rgba(255,255,255,0.06)] rounded-xl p-2">
              {/* Önizleme */}
              <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-navy-700 shrink-0">
                {item.type === "image" && item.thumbnail ? (
                  <Image src={item.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                ) : item.type === "image" && item.url ? (
                  <Image src={item.url} alt="" fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video size={20} strokeWidth={1} className="text-silver-500" />
                  </div>
                )}
                {item.isPrimary && (
                  <div className="absolute top-0.5 left-0.5 px-1 py-px rounded text-[9px] font-bold bg-gold-500 text-navy-900 leading-tight">
                    Ana
                  </div>
                )}
              </div>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cream-200 truncate">
                  {item.type === "video" ? "Video" : "Fotoğraf"} #{i + 1}
                </p>
                <p className="text-[10px] text-silver-600 truncate">{item.url.split("/").pop()}</p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Sırala */}
                <button type="button" onClick={() => moveItem(i, "up")} disabled={i === 0} title="Yukarı"
                  className="w-7 h-7 rounded flex items-center justify-center text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors disabled:opacity-25">
                  <ChevronUp size={14} strokeWidth={1.5} />
                </button>
                <button type="button" onClick={() => moveItem(i, "down")} disabled={i === value.length - 1} title="Aşağı"
                  className="w-7 h-7 rounded flex items-center justify-center text-silver-500 hover:text-cream-100 hover:bg-white/5 transition-colors disabled:opacity-25">
                  <ChevronDown size={14} strokeWidth={1.5} />
                </button>

                {/* Ana fotoğraf — sadece resimler için */}
                {item.type === "image" && (
                  <button type="button" onClick={() => setPrimary(i)} title="Ana fotoğraf yap"
                    className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
                      item.isPrimary ? "bg-gold-500 text-navy-900" : "text-silver-400 hover:text-gold-400 hover:bg-white/5"
                    }`}>
                    <Star size={13} strokeWidth={2} fill={item.isPrimary ? "currentColor" : "none"} />
                  </button>
                )}

                {/* Sil */}
                <button type="button" onClick={() => remove(i)} title="Kaldır"
                  className="w-7 h-7 rounded flex items-center justify-center text-silver-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}

          {/* Yükleniyor placeholder'ları */}
          {Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`uploading-${i}`}
              className="flex items-center gap-3 bg-navy-800 border border-[rgba(212,167,68,0.12)] rounded-xl p-2">
              <div className="w-16 h-12 rounded-lg bg-navy-700 flex items-center justify-center shrink-0">
                <Loader2 size={16} strokeWidth={1.5} className="text-gold-500 animate-spin" />
              </div>
              <p className="text-xs text-silver-500">Yükleniyor...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
