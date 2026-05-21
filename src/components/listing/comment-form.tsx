"use client";

import { useState, useTransition } from "react";
import { Star, Loader2 } from "lucide-react";
import { createComment } from "@/lib/actions/comment";

interface CommentFormProps {
  listingId: string;
  isLoggedIn: boolean;
}

export default function CommentForm({ listingId, isLoggedIn }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <div className="bg-navy-800/60 border border-[rgba(212,167,68,0.12)] rounded-xl p-6 text-center">
        <p className="text-silver-400 text-sm mb-3">
          Yorum yazmak için giriş yapmanız gerekiyor.
        </p>
        <a
          href="/tr/giris"
          className="inline-block px-5 py-2.5 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors"
        >
          Giriş Yap
        </a>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await createComment({
        listingId,
        content,
        rating: rating > 0 ? rating : undefined,
      });
      setResult(res);
      if (res.success) {
        setContent("");
        setRating(0);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Yıldız puanlama */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2">
          Puan (opsiyonel)
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star === rating ? 0 : star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`${star} yıldız`}
            >
              <Star
                size={20}
                strokeWidth={1.5}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-gold-500 text-gold-500"
                    : "text-navy-600"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Yorum metni */}
      <div>
        <label
          htmlFor="comment-content"
          className="block text-xs font-semibold uppercase tracking-wider text-silver-400 mb-2"
        >
          Yorumunuz
        </label>
        <textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Bu ilan hakkındaki düşüncelerinizi paylaşın..."
          className="w-full bg-navy-800/60 border border-[rgba(216,220,228,0.12)] rounded-xl px-4 py-3 text-cream-100 text-sm placeholder:text-silver-600 resize-none focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-colors"
        />
        <p className="text-xs text-silver-600 mt-1 text-right">{content.length}/1000</p>
      </div>

      {/* Sonuç mesajı */}
      {result?.error && (
        <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
          {result.error}
        </p>
      )}
      {result?.success && (
        <p className="text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2">
          Yorumunuz yayınlandı.
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || content.length < 10}
        className="px-6 py-2.5 rounded-full bg-gold-500 text-navy-900 font-semibold text-sm hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isPending && <Loader2 size={14} className="animate-spin" />}
        <span>Yorum Gönder</span>
      </button>
    </form>
  );
}
