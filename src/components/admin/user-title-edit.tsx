"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Check } from "lucide-react";
import { updateUserTitle } from "@/lib/actions/user";

interface Props {
  userId: string;
  currentTitle: string | null;
}

export default function UserTitleEdit({ userId, currentTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(currentTitle ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateUserTitle(userId, { title });
      if ("error" in result && !result.success) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ünvan düzenle"
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-silver-400 hover:text-cream-100 border border-navy-600 text-xs transition-colors"
      >
        <Pencil size={12} strokeWidth={1.5} />
        Ünvan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-800 border border-navy-700 rounded-2xl w-full max-w-xs p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg text-cream-50">Ünvan Düzenle</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-navy-700 flex items-center justify-center text-silver-500"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-silver-400 uppercase tracking-wider mb-1.5">
                  Ünvan
                  <span className="ml-1 text-silver-600 normal-case">(ör. Emlak Danışmanı)</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Emlak Danışmanı"
                  maxLength={100}
                  className="w-full bg-navy-900 border border-navy-600 focus:border-gold-500 rounded-xl px-3 py-2.5 text-cream-100 text-sm outline-none transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-navy-600 text-silver-400 py-2.5 rounded-full text-sm hover:border-navy-500 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-gold-500 hover:bg-gold-400 disabled:opacity-60 text-navy-900 font-semibold py-2.5 rounded-full text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  {isPending ? "Kaydediliyor…" : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
