"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { createGalleryItem } from "@/lib/actions/gallery";
import { Upload, Link as LinkIcon, Plus } from "lucide-react";

export default function GalleryAddForm() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"image" | "video">("image");
  const [url, setUrl] = useState("");
  const [titleTr, setTitleTr] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setUrl(data.url);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    startTransition(async () => {
      const res = await createGalleryItem({ type, url, titleTr: titleTr || null, category: category || null });
      if (res.success) {
        setUrl(""); setTitleTr(""); setCategory(""); setOpen(false);
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors">
        <Plus size={16} strokeWidth={2} /> Ekle
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit}
      className="bg-navy-800 border border-[var(--border-default)] rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-cream-100">Yeni Galeri Öğesi</p>
        <button type="button" onClick={() => setOpen(false)} className="text-silver-500 hover:text-cream-100 text-xs">İptal</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tür */}
        <div>
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Tür</label>
          <select value={type} onChange={(e) => setType(e.target.value as "image" | "video")}
            className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-lg text-sm text-cream-100 [&>option]:bg-navy-900">
            <option value="image">Fotoğraf</option>
            <option value="video">Video (URL)</option>
          </select>
        </div>

        {/* Kategori */}
        <div>
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Kategori</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-lg text-sm text-cream-100 [&>option]:bg-navy-900">
            <option value="">Seçiniz</option>
            <option value="achievement">Başarı</option>
            <option value="event">Etkinlik</option>
            <option value="office">Ofis</option>
            <option value="team">Ekip</option>
          </select>
        </div>

        {/* URL / Upload */}
        <div className="sm:col-span-2">
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">
            {type === "image" ? "Fotoğraf" : "Video URL"}
          </label>
          {type === "image" ? (
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL veya aşağıdan yükle"
                className="flex-1 h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-lg text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60" />
              <label className="flex items-center gap-1.5 h-10 px-4 rounded-lg bg-navy-700 border border-[var(--border-subtle)] text-silver-300 text-sm cursor-pointer hover:bg-navy-600 transition-colors">
                <Upload size={14} strokeWidth={1.5} />
                {uploading ? "Yükleniyor..." : "Yükle"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LinkIcon size={16} strokeWidth={1.5} className="text-silver-500 shrink-0" />
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube veya Vimeo URL"
                className="flex-1 h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-lg text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60" />
            </div>
          )}
          {url && type === "image" && (
            <img src={url} alt="" className="mt-2 h-20 w-auto rounded-lg object-cover border border-[var(--border-subtle)]" />
          )}
        </div>

        {/* Başlık */}
        <div className="sm:col-span-2">
          <label className="text-xs text-silver-400 uppercase tracking-wider mb-1.5 block">Başlık (isteğe bağlı)</label>
          <input value={titleTr} onChange={(e) => setTitleTr(e.target.value)} placeholder="Galeri öğesi başlığı"
            className="w-full h-10 px-3 bg-navy-900 border border-[var(--border-subtle)] rounded-lg text-sm text-cream-100 placeholder-silver-600 focus:outline-none focus:border-gold-500/60" />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button type="button" onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-silver-400 text-sm hover:text-cream-100 transition-colors">İptal</button>
        <button type="submit" disabled={isPending || !url || uploading}
          className="px-5 py-2 rounded-full bg-gold-500 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
          {isPending ? "Ekleniyor..." : "Ekle"}
        </button>
      </div>
    </form>
  );
}
