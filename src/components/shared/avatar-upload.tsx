"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, UserCircle2, Check } from "lucide-react";
import { updateSelfProfile } from "@/lib/actions/user";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  currentName: string;
}

export default function AvatarUpload({ currentAvatar, currentName }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentAvatar ?? null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSaved(false);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok || !data.url) {
        setError(data.error ?? "Yükleme başarısız");
        return;
      }

      setPreview(data.url);
      startTransition(async () => {
        const result = await updateSelfProfile({ name: currentName, avatar: data.url });
        if ("error" in result) {
          setError(result.error);
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const isLoading = uploading || isPending;

  return (
    <div className="relative group">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-navy-800 border-2 border-[var(--border-subtle)] group-hover:border-gold-500/40 transition-colors">
        {preview ? (
          <img src={preview} alt={currentName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle2 size={32} strokeWidth={1} className="text-silver-500" />
          </div>
        )}
      </div>

      {/* Upload overlay */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
        className="absolute inset-0 rounded-full flex items-center justify-center bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
        aria-label="Profil fotoğrafı değiştir"
      >
        {isLoading ? (
          <Loader2 size={16} strokeWidth={1.5} className="text-cream-100 animate-spin" />
        ) : saved ? (
          <Check size={16} strokeWidth={2} className="text-green-400" />
        ) : (
          <Camera size={16} strokeWidth={1.5} className="text-cream-100" />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />

      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 text-center text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1 z-10">
          {error}
        </div>
      )}
    </div>
  );
}
