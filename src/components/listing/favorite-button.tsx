"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/actions/favorite";
import { useRouter } from "@/i18n/navigation";

interface FavoriteButtonProps {
  listingId: string;
  initialFavorited: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function FavoriteButton({
  listingId,
  initialFavorited,
  size = "sm",
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const iconSize = size === "sm" ? 15 : 20;
  const btnSize = size === "sm" ? "w-9 h-9" : "w-11 h-11";

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      try {
        const result = await toggleFavorite(listingId);
        setFavorited(result.favorited);
      } catch {
        router.push("/giris");
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={favorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={[
        btnSize,
        "rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-60",
        favorited
          ? "bg-gold-500/20 text-gold-400 border border-gold-500/40 hover:bg-gold-500/30"
          : "bg-navy-900/70 backdrop-blur-sm text-cream-200 border border-transparent hover:text-gold-400 hover:bg-navy-800/80",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Heart
        size={iconSize}
        strokeWidth={1.5}
        className={favorited ? "fill-gold-400" : ""}
      />
    </button>
  );
}
